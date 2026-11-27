import os
import subprocess
import sys
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import jwt
from fastapi.testclient import TestClient

_TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.dirname(_TESTS_DIR)
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

import auth
from main import app


class TestAdminAuthBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client_cm = TestClient(app)
        cls.client = cls.client_cm.__enter__()
        cls.admin_username = os.getenv("ADMIN_USERNAME")
        cls.admin_password = os.getenv("ADMIN_PASSWORD") or "admin123"

    @classmethod
    def tearDownClass(cls):
        cls.client_cm.__exit__(None, None, None)

    def _login_admin(self):
        res = self.client.post(
            "/api/admin/login",
            data={"username": self.admin_username, "password": self.admin_password},
        )
        self.assertEqual(res.status_code, 200, res.text)
        body = res.json()
        self.assertEqual(body["role"], "admin")
        self.assertEqual(body["username"], self.admin_username)
        self.assertTrue(body["access_token"])
        return body["access_token"]

    def test_startup_fails_loudly_on_missing_or_insecure_config(self):
        cases = [
            {"JWT_SECRET": "", "ADMIN_JWT_SECRET": ""},
            {"JWT_SECRET": "too-short"},
            {"JWT_SECRET": "gameverse_fallback_jwt_secret_key_2026_super_secure"},
            {"ADMIN_USERNAME": ""},
            {"ADMIN_PASSWORD_HASH": "", "ADMIN_PASSWORD": ""},
            {"ADMIN_PASSWORD_HASH": "not-a-bcrypt-hash", "ADMIN_PASSWORD": ""},
        ]
        for overrides in cases:
            env = os.environ.copy()
            # Prevent load_dotenv from re-populating empty keys by passing invalid/empty explicitly
            env.update(overrides)
            code = (
                "import os, dotenv; "
                "dotenv.load_dotenv = lambda *a, **k: False; "
                "import auth"
            )
            proc = subprocess.run(
                [sys.executable, "-c", code],
                cwd=_BACKEND_DIR,
                env=env,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(
                proc.returncode,
                0,
                f"Expected auth import to fail for overrides={overrides}, got 0",
            )
            self.assertIn("RuntimeError", proc.stderr)

    def test_admin_login_verify_and_full_game_crud(self):
        token = self._login_admin()

        # Verify endpoint preserves admin identity
        v = self.client.get("/api/admin/verify", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(v.status_code, 200, v.text)
        self.assertEqual(
            v.json(),
            {
                "authenticated": True,
                "is_admin": True,
                "username": self.admin_username,
                "role": "admin",
                "avatar_url": None,
            },
        )

        # Verify token claims are strictly scoped
        claims = jwt.decode(token, options={"verify_signature": False})
        self.assertEqual(claims.get("typ"), auth.ADMIN_TOKEN_TYPE)
        self.assertEqual(claims.get("iss"), auth.ADMIN_JWT_ISSUER)
        self.assertEqual(claims.get("aud"), auth.ADMIN_JWT_AUDIENCE)
        self.assertEqual(claims.get("role"), "admin")
        self.assertTrue(claims.get("jti"))

        created_id = None
        try:
            # Create game
            c = self.client.post(
                "/api/games",
                headers={"Authorization": f"Bearer {token}"},
                data={
                    "game_name": "__AUTH_TEST_GAME__",
                    "description": "Temp test game",
                    "play_status": "playing",
                },
            )
            self.assertEqual(c.status_code, 200, c.text)
            created_id = c.json()["game_id"]

            # Update game
            u = self.client.put(
                f"/api/games/{created_id}",
                headers={"Authorization": f"Bearer {token}"},
                data={
                    "game_name": "__AUTH_TEST_GAME_EDITED__",
                    "description": "Edited temp test game",
                    "play_status": "completed",
                },
            )
            self.assertEqual(u.status_code, 200, u.text)

            # Patch status
            p = self.client.patch(
                f"/api/games/{created_id}/status",
                headers={"Authorization": f"Bearer {token}"},
                json={"is_favorited": True},
            )
            self.assertEqual(p.status_code, 200, p.text)

            # Verify persisted edit
            g = self.client.get(f"/api/games/{created_id}")
            self.assertEqual(g.status_code, 200, g.text)
            self.assertEqual(g.json()["game_name"], "__AUTH_TEST_GAME_EDITED__")
            self.assertTrue(g.json()["is_favorited"])
        finally:
            if created_id is not None:
                d = self.client.delete(
                    f"/api/games/{created_id}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                self.assertEqual(d.status_code, 200, d.text)

    def test_hardcoded_backdoors_rejected(self):
        for bad_user, bad_pass in [
            ("admin", "admin"),
            ("admin", "admin@123"),
            ("administrator", self.admin_password),
            ("root", self.admin_password),
        ]:
            res = self.client.post(
                "/api/admin/login",
                data={"username": bad_user, "password": bad_pass},
            )
            self.assertEqual(res.status_code, 401, f"Expected 401 for {bad_user}/{bad_pass}")

    def test_tampered_expired_wrong_type_and_alg_none_tokens_rejected(self):
        valid_token = self._login_admin()
        signing_key = auth._derive_admin_signing_key()
        now = datetime.now(timezone.utc)

        # Tamper signature
        parts = valid_token.split(".")
        tampered = f"{parts[0]}.{parts[1]}.tamperedsig"

        # Expired admin token
        expired = jwt.encode(
            {
                "sub": self.admin_username,
                "typ": auth.ADMIN_TOKEN_TYPE,
                "iss": auth.ADMIN_JWT_ISSUER,
                "aud": auth.ADMIN_JWT_AUDIENCE,
                "role": "admin",
                "jti": "test",
                "iat": now - timedelta(hours=5),
                "exp": now - timedelta(minutes=1),
            },
            signing_key,
            algorithm="HS256",
        )

        # Signed with raw JWT_SECRET instead of derived admin key
        wrong_key = jwt.encode(
            {
                "sub": self.admin_username,
                "typ": auth.ADMIN_TOKEN_TYPE,
                "iss": auth.ADMIN_JWT_ISSUER,
                "aud": auth.ADMIN_JWT_AUDIENCE,
                "role": "admin",
                "jti": "test",
                "iat": now,
                "exp": now + timedelta(hours=1),
            },
            auth.JWT_SECRET,
            algorithm="HS256",
        )

        # Wrong typ claim
        wrong_type = jwt.encode(
            {
                "sub": self.admin_username,
                "typ": "user",
                "iss": auth.ADMIN_JWT_ISSUER,
                "aud": auth.ADMIN_JWT_AUDIENCE,
                "role": "admin",
                "jti": "test",
                "iat": now,
                "exp": now + timedelta(hours=1),
            },
            signing_key,
            algorithm="HS256",
        )

        # Wrong issuer
        wrong_iss = jwt.encode(
            {
                "sub": self.admin_username,
                "typ": auth.ADMIN_TOKEN_TYPE,
                "iss": "other-issuer",
                "aud": auth.ADMIN_JWT_AUDIENCE,
                "role": "admin",
                "jti": "test",
                "iat": now,
                "exp": now + timedelta(hours=1),
            },
            signing_key,
            algorithm="HS256",
        )

        # alg=none token
        alg_none = jwt.encode(
            {
                "sub": self.admin_username,
                "typ": auth.ADMIN_TOKEN_TYPE,
                "iss": auth.ADMIN_JWT_ISSUER,
                "aud": auth.ADMIN_JWT_AUDIENCE,
                "role": "admin",
                "iat": now,
                "exp": now + timedelta(hours=1),
            },
            None,
            algorithm="none",
        )

        for bad_tok in [tampered, expired, wrong_key, wrong_type, wrong_iss, alg_none, "not-a-jwt"]:
            v = self.client.get("/api/admin/verify", headers={"Authorization": f"Bearer {bad_tok}"})
            self.assertEqual(v.status_code, 401, f"Expected 401 on verify, got {v.status_code}: {v.text}")
            g = self.client.post(
                "/api/games",
                headers={"Authorization": f"Bearer {bad_tok}"},
                data={"game_name": "Unauthorized"},
            )
            self.assertEqual(g.status_code, 401, f"Expected 401 on /api/games, got {g.status_code}")

    def test_token_substitution_impossible_in_either_direction(self):
        admin_token = self._login_admin()
        # 1. Admin token must never decode as a Supabase user token
        self.assertIsNone(auth.decode_supabase_token(admin_token))

        # 2. A Supabase-shaped HS256 token signed with JWT_SECRET (even claiming username=ADMIN_USERNAME) is rejected
        now = datetime.now(timezone.utc)
        forged_supa = jwt.encode(
            {
                "sub": "00000000-0000-0000-0000-000000000001",
                "aud": "authenticated",
                "iss": f"{auth.SUPABASE_URL}/auth/v1",
                "user_metadata": {"username": self.admin_username},
                "iat": now,
                "exp": now + timedelta(hours=1),
            },
            auth.JWT_SECRET,
            algorithm="HS256",
        )
        self.assertIsNone(auth.decode_supabase_token(forged_supa))
        self.assertIsNone(auth.decode_admin_token(forged_supa))
        v = self.client.get("/api/admin/verify", headers={"Authorization": f"Bearer {forged_supa}"})
        self.assertEqual(v.status_code, 401)

        # 3. Even if a valid Supabase HS256 user token has user_metadata.username == ADMIN_USERNAME,
        #    it must NEVER elevate to admin unless public.profiles.role == 'admin'
        supa_secret = "test-supabase-only-secret-32chars!!"
        valid_supa_token = jwt.encode(
            {
                "sub": "00000000-0000-0000-0000-000000000099",
                "aud": "authenticated",
                "iss": f"{auth.SUPABASE_URL}/auth/v1",
                "user_metadata": {"username": self.admin_username},
                "iat": now,
                "exp": now + timedelta(hours=1),
            },
            supa_secret,
            algorithm="HS256",
        )
        with patch.object(auth, "SUPABASE_JWT_SECRET", supa_secret):
            self.assertIsNone(auth.decode_admin_token(valid_supa_token))
            v2 = self.client.get("/api/admin/verify", headers={"Authorization": f"Bearer {valid_supa_token}"})
            self.assertEqual(v2.status_code, 200)
            self.assertFalse(v2.json()["is_admin"])
            self.assertEqual(v2.json()["role"], "user")

            for method, path, kwargs in [
                ("post", "/api/games", {"data": {"game_name": "Blocked"}}),
                ("put", "/api/games/1", {"data": {"game_name": "Blocked"}}),
                ("patch", "/api/games/1/status", {"json": {"is_favorited": True}}),
                ("delete", "/api/games/1", {}),
                ("post", "/api/developers", {"json": {"developer_name": "Blocked"}}),
                ("post", "/api/publishers", {"json": {"publisher_name": "Blocked"}}),
            ]:
                resp = getattr(self.client, method)(
                    path,
                    headers={"Authorization": f"Bearer {valid_supa_token}"},
                    **kwargs,
                )
                self.assertEqual(resp.status_code, 403, f"{method.upper()} {path} returned {resp.status_code}")

    def test_anonymous_and_real_supabase_user_cannot_reach_admin_endpoints(self):
        # Anonymous rejected with 401
        self.assertEqual(self.client.get("/api/admin/verify").status_code, 401)
        self.assertEqual(self.client.post("/api/games", data={"game_name": "Anon"}).status_code, 401)

        # Real Supabase user login (from earlier E2E test account)
        login_res = self.client.post(
            "/api/auth/login",
            json={"identifier": "santoshnidhi75@gmail.com", "password": "GvTest!2026Alpha"},
        )
        self.assertEqual(login_res.status_code, 200, login_res.text)
        user_body = login_res.json()
        self.assertEqual(user_body["user"]["role"], "user")
        user_tok = user_body["access_token"]

        v = self.client.get("/api/admin/verify", headers={"Authorization": f"Bearer {user_tok}"})
        self.assertEqual(v.status_code, 200)
        self.assertFalse(v.json()["is_admin"])
        self.assertEqual(v.json()["role"], "user")

        g = self.client.post(
            "/api/games",
            headers={"Authorization": f"Bearer {user_tok}"},
            data={"game_name": "UserBlocked"},
        )
        self.assertEqual(g.status_code, 403)


if __name__ == "__main__":
    unittest.main()
