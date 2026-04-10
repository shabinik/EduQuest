from django.db import models
from django.conf import settings

# Create your models here.

class Notification(models.Model):
    TYPE_CHOICES = [
        ("assignment", "Assignment"),
        ("exam",         "Exam Scheduled"),
        ("fee",          "Fee Bill Generated"),
        ("announcement", "Announcement Posted"),
        ("meeting",      "Meeting Created"),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name="notifications")
    notif_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title      = models.CharField(max_length=255)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    link       = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notif_type}] → {self.recipient.email}"

