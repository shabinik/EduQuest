from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

# Create your models here.

class Teacher(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='teacher_profile')
    qualification = models.CharField(max_length=225,blank=True)
    salary = models.DecimalField(max_digits=10,decimal_places=2,default=0)
    joining_date = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email}"
    


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    admission_number = models.CharField(max_length=50, unique=True)
    school_class = models.ForeignKey("classroom.SchoolClass",on_delete=models.SET_NULL,null=True,blank=True,related_name="students")
    roll_number = models.PositiveIntegerField()
    admission_date = models.DateField(default=timezone.now)

    guardian_name = models.CharField(max_length=225, blank=True, null=True)
    guardian_contact = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name or self.user.email} - {self.admission_number}"


