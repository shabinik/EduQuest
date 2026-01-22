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


class Subject(models.Model):
    tenant = models.ForeignKey("accounts.Tenant",on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tenant','name')
        ordering = ['name']

    def __str__(self):
        return self.name
    

class TimeSlot(models.Model):
    tenant = models.ForeignKey("accounts.Tenant",on_delete=models.CASCADE, related_name="time_slots")
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)

    class Meta:
        unique_together = ("tenant","start_time","end_time")
        ordering = ["start_time"]

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time.")
        
    def __str__(self):
        return f"{self.start_time} - {self.end_time}"
    



class TimeTable(models.Model):
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE,related_name="timetables")
    school_class = models.ForeignKey(SchoolClass,on_delete=models.CASCADE, related_name="timetable")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Timetable - {self.school_class}"
    

class TimeTableEntry(models.Model):

    DAYS = [
        ("mon", "Monday"),
        ("tue", "Tuesday"),
        ("wed", "Wednesday"),
        ("thu", "Thursday"),
        ("fri", "Friday"),
        ("sat", "Saturday"),
    ]

    tenant = models.ForeignKey("accounts.Tenant",on_delete=models.CASCADE,related_name="timetable_entries")
    timetable = models.ForeignKey(TimeTable,on_delete=models.CASCADE,related_name="entries")
    day = models.CharField(max_length=10, choices=DAYS)
    slot = models.ForeignKey(TimeSlot,on_delete = models.CASCADE,related_name="entries")
    subject = models.ForeignKey(Subject,on_delete=models.CASCADE,related_name="entries", null=True, blank=True)
    teacher = models.ForeignKey("users.Teacher",on_delete=models.CASCADE, related_name="timetable_entries", null=True, blank=True)

    class Meta:
        unique_together = ("timetable","day","slot")
    
    def __str__(self):
        return f"{self.day} | {self.slot} | {self.subject}"


    
