from rest_framework import generics
from accounts.permissions import IsSuperAdmin,IsAdmin
from rest_framework.permissions import IsAuthenticated
from . models import SubscriptionPlan,Subscription,Payment
from . serializers import SubscriptionPlanSerializer,SubscriptionSerializer,PaymentSerializer
import razorpay
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone



# Create your views here.

#SUPER ADMINS VIEWS

class SubscriptionPlanListCreateView(generics.ListCreateAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active = True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsSuperAdmin]

    

class SubscriptionPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsSuperAdmin]

    def destroy(self, request, *args, **kwargs):
        plan = self.get_object()

        plan.is_active = False
        plan.save()

        return Response(
            {"message": "Plan deactivated successfully. Existing subscribers remain active until expiry."},
            status=status.HTTP_200_OK
        )


#SCHOOLS VIEWS

class ActivePlanView(generics.ListAPIView):

    queryset = SubscriptionPlan.objects.filter(is_active = True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]



class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request,plan_id):
        user = request.user

        if not user.tenant:
            return Response({"error":"User must be assigned to a tenant."},status=400)
        
        tenant = user.tenant
        plan = get_object_or_404(SubscriptionPlan,id = plan_id,is_active = True)

        # Razorpay Client
        client = razorpay.Client(
            auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        amount_paise = int(plan.price * 100)
        
        # Build short Tenant
        short_tenant = str(tenant.id)[:6]  # first 6 chars of UUID
        timestamp = int(timezone.now().timestamp())
        receipt = f"ord_ten{short_tenant}_p{plan.id}_{timestamp}"
        # Create Order Payload
        order_data = {
            "amount":amount_paise,
            "currency":plan.currency,
            "receipt": receipt,
        }

        order = client.order.create(order_data)

        # Create Subscription (pending)
        subscription = Subscription.objects.create(
            plan = plan,
            tenant = tenant,
            is_active = False
        )

        # Create Payment Record
        payment = Payment.objects.create(
            tenant = tenant,
            subscription = subscription,
            amount = plan.price,
            currency = plan.currency,
            razorpay_order_id = order["id"],
            status = "pending"
        )

        return Response({
            "order":order,
            "subscription_id":subscription.id,
            "payment_id":payment.id,
            "razorpay_key":settings.RAZORPAY_KEY_ID
        })
    

class VerifyPaymentView(APIView):

    #Razorpay returns: payment_id,order_id and signature

    permission_classes = [IsAuthenticated]

    def post(self,request):
        data = request.data
        payment = get_object_or_404(Payment, id = data.get("payment_id"))

        client = razorpay.Client(
            auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        params = {
            "razorpay_order_id":data.get("razorpay_order_id"),
            "razorpay_payment_id":data.get("razorpay_payment_id"),
            "razorpay_signature":data.get("razorpay_signature"),
        }
    
        # Verify Signature
        try:
            client.utility.verify_payment_signature(params)
        except Exception:
            payment.status = "failed"
            payment.save()
            return Response({"error":"Signature verification failed"},status=status.HTTP_400_BAD_REQUEST)
        
        #update payment
        payment.status = "paid"
        payment.razorpay_payment_id = data.get("razorpay_payment_id")
        payment.razorpay_signature = data.get("razorpay_signature")
        payment.save()

        #Activate Subscription
        subscription = payment.subscription
        subscription.is_active = True
        subscription.payment_reference = payment.razorpay_payment_id
        subscription.save()

        tenant = subscription.tenant
        tenant.status = "active"
        tenant.save()

        return Response({
            "success":True,
            "message":"Payment verified",
            "has_active_subscription":True,
            "expiry_date":subscription.expiry_date,
        })
    

class TenantSubscriptionsView(generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tenant = getattr(user,"tenant",None)
        if not tenant:
            return Subscription.objects.none()
        return Subscription.objects.filter(tenant=tenant,is_active = True).order_by("-start_date")

class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant

        has_active = Subscription.objects.filter(
            tenant = tenant, is_active = True, expiry_date__gte = timezone.now()
        ).exists()

        sub = Subscription.objects.filter(tenant = tenant, is_active = True).first()

        return Response({
            "has_active_subscription": has_active,
            "expiry_date": sub.expiry_date if sub else None
        })
    

        

