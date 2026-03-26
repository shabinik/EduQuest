from django.db import models
from classroom.models import SchoolClass
from django.conf import settings
import uuid


# Create your models here.


# ------------Student AI Chat-------------

class AIChatMessage(models.Model):
    ROLE_CHOICES = [
        ("assistant","Assistant"),
        ("user","User")
    ]
    student = models.ForeignKey("users.Student",on_delete=models.CASCADE,related_name="ai_messages")
    role = models.CharField(max_length= 20, choices=ROLE_CHOICES)
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    

# ------- Video Call -----------

class Meeting(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("live", "Live"),
        ("ended", "Ended"),
        ("cancelled", "Cancelled"),
    ]

    TYPE_CHOICES = [
        ("staff_meeting", "Staff Meeting"),   # admin only, for all staff
        ("class_meeting", "Class Meeting"),   # teacher only, for one class
    ]

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="created_meetings")
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE,related_name="meetings")
    meeting_type = models.CharField(max_length=20,choices=TYPE_CHOICES)
    school_class = models.ForeignKey("classroom.SchoolClass",on_delete=models.SET_NULL,null=True,blank=True,related_name="meetings")
    title = models.CharField(max_length=225)
    description = models.TextField(blank=True, null=True)

    # Auto-generated unique Jitsi room name e.g. "eduquest-3f2a1b9c"
    room_name = models.CharField(max_length=255, unique=True, blank=True)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at"]
        verbose_name = "Meeting"
        verbose_name_plural = "Meetings"

    def save(self, *args, **kwargs):
        if not self.room_name:
            self.room_name = f"eduquest-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    @property
    def jitsi_url(self):
        return f"https://meet.jit.si/{self.room_name}"

    def __str__(self):
        return f"{self.title} [{self.get_meeting_type_display()}] ({self.get_status_display()})"
