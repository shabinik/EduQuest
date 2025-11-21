from django.conf import settings

class CookieToHeaderMiddleware:
    
    #Copy access_token cookie into the Authorization header so DRF's JWTAuthentication works.
    def __init__(self,get_response):
        self.get_response = get_response

    def __call__(self,request):
        access = request.COOKIES.get("access_token")
        if access and "HTTP_AUTHORIZATION" not in request.META:
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access}"
        return self.get_response(request)
        
        