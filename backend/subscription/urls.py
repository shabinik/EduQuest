from django.urls import path 
from . views import (
    SubscriptionPlanListCreateView,
    SubscriptionPlanDetailView,
    ActivePlanView,
    CreateOrderView,
    VerifyPaymentView,
    TenantSubscriptionsView,
    SubscriptionStatusView,
    DownloadInvoiceView,
)

urlpatterns = [
    path('plans/',SubscriptionPlanListCreateView.as_view()),
    path('plans/<int:pk>/',SubscriptionPlanDetailView.as_view()),
    path('active-plans/',ActivePlanView.as_view()),
    path('create-order/<int:plan_id>/',CreateOrderView.as_view()),
    path('verify-payment/',VerifyPaymentView.as_view()),
    path('tenant-subscriptions/',TenantSubscriptionsView.as_view()),
    path("status/", SubscriptionStatusView.as_view()),
    path("invoice/<int:payment_id>/",  DownloadInvoiceView.as_view()),
]