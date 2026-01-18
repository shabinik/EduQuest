from django.db import models

# Create your models here.

class Announcement(models.Model):
    AUDIENCE_CHOICES = [
        ('all', 'All'),
        ('teachers', 'Teachers'),
        ('students', 'Students'),
    ]

    tenant = models.ForeignKey('accounts.Tenant', on_delete=models.CASCADE, related_name="announcements")
    title = models.CharField(max_length=225)
    description = models.TextField()
    attachment = models.CharField(max_length=225, blank=True, null=True)
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    expiry_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = [ "-created_at" ]

    def __str__(self):
        return f"{self.title} ({self.target_audience})"