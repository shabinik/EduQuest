from django.db import models
from django.conf import settings
from accounts.models import Tenant
from decimal import Decimal
from django.utils import timezone
from dateutil.relativedelta import relativedelta


# Create your models here.

class SubscriptionPlan(models.Model):
    plan_name = models.CharField(max_length=225)
    description = models.TextField(blank=True,null=True)
    is_active = models.BooleanField(default=True)
    duration_months = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2,default=Decimal('0.00'))
    currency = models.CharField(max_length=10,default='INR')
    max_students = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Subscription Plan"
        verbose_name_plural = "Subscription Plans"

    def __str__(self):
        return f"{self.plan_name} ({self.duration_months} mo)"
    



class Subscription(models.Model):
    plan = models.ForeignKey(SubscriptionPlan,on_delete=models.PROTECT,related_name='subscriptions')
    tenant = models.ForeignKey("accounts.Tenant",on_delete=models.CASCADE,related_name='subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField(blank=True,null=True)
    is_active = models.BooleanField(default=False)
    payment_reference = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"

    def save(self,*args,**kwargs):
        if not self.pk and not self.expiry_date:
            self.expiry_date = self.start_date + relativedelta(months=self.plan.duration_months)
        super().save(*args,**kwargs)




class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending','Pending'),
        ('paid','Paid'),
        ('failed','Failed'),
        ('refunded','Refunded'),
    ]
    tenant = models.ForeignKey("accounts.Tenant",on_delete=models.CASCADE,related_name='payments')
    subscription = models.ForeignKey(Subscription,on_delete=models.SET_NULL,null=True,blank=True,related_name='payment')
    amount = models.DecimalField(max_digits=10,decimal_places=2)
    currency = models.CharField(max_length=10,default='INR')

    razorpay_order_id = models.CharField(max_length=225,blank=True,null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=512, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"{self.tenant.institute_name} - {self.amount} {self.currency} ({self.status})"






