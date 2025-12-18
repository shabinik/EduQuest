from django.urls import path
from .views import LoginView,LogoutView,ProfileView,AdminSingupView,AdminVerifyEmailView,ChangePasswordView,ProfileImageUploadView,AdminProfileView

urlpatterns = [
    path("login/",LoginView.as_view(),name="login"),
    path("logout/",LogoutView.as_view(),name='logout'),
    path("profile/",ProfileView.as_view(),name="profile"),
    path("admin/signup/",AdminSingupView.as_view(),name='admin-signup'),
    path('admin/verify-email/',AdminVerifyEmailView.as_view(),name='admin-verify-email'),
    path('change-password/', ChangePasswordView.as_view(),name='change-password'),
    path("profile/image/", ProfileImageUploadView.as_view(), name="profile-image"),
    path("admin/profile/", AdminProfileView.as_view(),name='admin-profile'),


]


