import os
import sys
from urllib.parse import parse_qsl, urlencode

_current_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_current_dir)
_backend_dir = os.path.join(_root_dir, "backend")

if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from main import app


class _VercelPathRestoreMiddleware:
    """On Vercel, a rewrite whose destination ends in '.py' replaces the path
    the function receives (every /api/* request arrives as /api/index.py), so
    FastAPI routes never match. vercel.json therefore appends the original path
    as ?realpath=<path>, which — unlike the request path — always survives the
    rewrite. This middleware restores it before the app routes the request.
    The x-vercel-original-path header is honoured as a fallback. No-op locally."""

    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            original = None
            query_pairs = parse_qsl(scope.get("query_string", b"").decode("latin-1"), keep_blank_values=True)
            kept_pairs = []
            for key, value in query_pairs:
                if key == "realpath" and value and original is None:
                    original = value
                else:
                    kept_pairs.append((key, value))
            if not original:
                for hkey, hvalue in scope.get("headers", []):
                    if hkey == b"x-vercel-original-path":
                        original = hvalue.decode("latin-1")
                        break
            if original and not original.startswith("/"):
                original = "/" + original
            if original and scope.get("path") != original:
                scope = dict(scope)
                scope["path"] = original
                scope["raw_path"] = original.encode("latin-1")
                scope["root_path"] = ""
                scope["query_string"] = urlencode(kept_pairs).encode("latin-1")
        await self.asgi_app(scope, receive, send)


app = _VercelPathRestoreMiddleware(app)
