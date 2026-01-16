from django.db import models
from django.core.exceptions import ValidationError


# Create your models here.

class SchoolClass(models.Model):
    tenant = models.ForeignKey("accounts.Tenant",on_delete=models.CASCADE,related_name="classes")
    name = models.CharField(max_length=20)
    division = models.CharField(max_length=20)
    class_teacher = models.ForeignKey("users.Teacher",on_delete=models.SET_NULL,null=True,blank=True,related_name="class_teacher_of")
    max_student = models.PositiveIntegerField(default=10)
    academic_year = models.CharField(max_length=15,default="2025-2026")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("tenant","name","division","academic_year")

    def __str__(self):
        return f"{self.name}-{self.division} ({self.academic_year})"




class TimeTable(models.Model):
    DAY_CHOICES = [
        ("mon","Monday"),
        ("tue","Tuesday"),
        ("wed","Wednesday"),
        ("thu","Thursday"),
        ("fri","Friday"),
        ("sat","Saturday"),
    ]

    class_obj = models.ForeignKey(SchoolClass,on_delete=models.CASCADE,related_name="timetable")
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey("users.Teacher",on_delete=models.SET_NULL,null=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("class_obj", "day", "start_time")