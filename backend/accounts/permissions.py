from rest_framework.permissions import BasePermission
from subscription.models import Subscription 
from django.utils import timezone


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "superadmin"
    

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"
    

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "teacher"


class HasActiveSubscription(BasePermission):
    message = "Subscription required. Please purchase a plan."

    def has_permission(self, request,view):
        user = request.user
        tenant = getattr(user,"tenant",None)
        if not tenant:
            return False
        subscription = Subscription.objects.filter(tenant=tenant,is_active = True).order_by('-expiry_date').first()

        if not subscription:
            return False
        
        if subscription.expiry_date and subscription.expiry_date < timezone.now():
            subscription.is_active = False
            subscription.save()

            return False
        
        return True
        