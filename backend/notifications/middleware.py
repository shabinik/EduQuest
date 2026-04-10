from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        validated = AccessToken(token)
        return User.objects.get(id=validated["user_id"])
    except Exception:
        return AnonymousUser()

class JWTCookieMiddleware:
    """
    Reads the access_token from the HTTP-only cookie
    sent automatically by the browser during WebSocket handshake.
    Browsers send cookies with WS handshake to the same domain — no JS needed.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Parse cookies from the WebSocket headers
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()

        # Extract access_token from cookie string
        token = None
        for part in cookie_header.split(";"):
            part = part.strip()
            if part.startswith("access_token="):
                token = part.split("=", 1)[1]
                break

        scope["user"] = await get_user_from_token(token) if token else AnonymousUser()

        return await self.app(scope, receive, send)