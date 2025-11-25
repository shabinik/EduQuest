from django.urls import path 
from . views import (
    SubscriptionPlanListCreateView,
    SubscriptionPlanDetailView,
    ActivePlanView,
    CreateOrderView,
    VerifyPaymentView
)

urlpatterns = [
    path('plans/',SubscriptionPlanListCreateView.as_view()),
    path('plans/<int:pk>/',SubscriptionPlanDetailView.as_view()),
    path('active-plans/',ActivePlanView.as_view()),
    path('create-order/<int:plan_id>/',CreateOrderView.as_view()),
    path('verify-payment/',VerifyPaymentView.as_view()),
]