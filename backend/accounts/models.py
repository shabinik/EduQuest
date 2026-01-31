from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

# Create your models here.

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    institute_name = models.CharField(max_length=225)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20,choices=[
        ("active" , "Active"),
        ("inactive" , "Inactive"),
        ("suspended","Suspended"),
        ("trial", "Trial")
    ],default='inactive')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.institute_name
    



class User(AbstractUser):
    full_name = models.CharField(max_length=225,blank=True,null=True)
    tenant = models.ForeignKey(Tenant,on_delete=models.SET_NULL,null=True,blank=True)
    ROLE_CHOICES = [
        ('superadmin', 'SuperAdmin'),
        ('admin', 'Admin'),
        ('teacher','Teacher'),
        ('student', 'Student')
    ]
    role = models.CharField(max_length=20,choices=ROLE_CHOICES,default='student')
    phone = models.CharField(max_length=15,blank=True,null=True)
    gender = models.CharField(max_length=50,choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ],blank=True,null=True)
    profile_image = models.CharField(max_length=225,blank=True,null=True)
    DOB = models.DateField(null=True,blank=True)
    must_change_password = models.BooleanField(default=True)
    
    def save(self,*args,**kwargs):
        if self.role == 'superadmin':
            self.tenant = None
        super().save(*args,**kwargs)




class EmailOtp(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='otps')
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return (not self.is_used) and timezone.now() <= self.expires_at
    
    def __str__(self):
        return f"{self.email} - {self.code}"
