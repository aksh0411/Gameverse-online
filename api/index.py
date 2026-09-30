import os
import sys

_current_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_current_dir)
_backend_dir = os.path.join(_root_dir, "backend")

if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from main import app


class _VercelOriginalPathMiddleware:
    """Vercel rewrites deliver the destination path (/api/index.py) in the ASGI
    scope, while the original client URL arrives in the x-vercel-original-path
    header. FastAPI routes miss unless we remap. No-op outside Vercel."""

    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            original = None
            for key, value in scope.get("headers", []):
                if key == b"x-vercel-original-path":
                    original = value.decode("latin-1")
                    break
            if original and scope.get("path") != original:
                scope = dict(scope)
                scope["path"] = original
                scope["raw_path"] = original.encode("latin-1")
                scope["root_path"] = ""
        await self.asgi_app(scope, receive, send)


app = _VercelOriginalPathMiddleware(app)
