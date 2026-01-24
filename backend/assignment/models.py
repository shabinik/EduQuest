from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField

# Create your models here.


class Assignment(models.Model):
    tenant = models.ForeignKey('accounts.Tenant', on_delete= models.CASCADE, related_name="assignments")
    teacher = models.ForeignKey('users.Teacher', on_delete=models.CASCADE, related_name='assignments')
    subject = models.ForeignKey('classroom.Subject', on_delete=models.CASCADE, related_name='assignments')
    classes = models.ManyToManyField('classroom.SchoolClass',related_name="assignments")

    title = models.CharField(max_length=225)
    description = models.TextField(blank = True)
    attachment = CloudinaryField("assignment_files", blank= True, null = True)
    due_date = models.DateTimeField()
    total_marks = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_overdue(self):
        return timezone.now() > self.due_date
    
    @property
    def submission_count(self):
        return self.submissions.count()
    
    def __str__(self):
        return self.title
    


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [
        ("submitted","Submitted"),
        ("pending", "Pending Review"),
        ("graded", "Graded"),
        ("late", "Late Submission")
    ]

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey("users.Student", on_delete=models.CASCADE, related_name="submissions")
    description = models.TextField(blank=True)
    attachment = CloudinaryField("submission_files")

    marks_obtained = models.FloatField(null=True,blank=True)
    feedback = models.TextField(blank=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default="submitted")
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_late(self):
        return self.submitted_at > self.assignment.due_date
    
    @property
    def percentage(self):
        if self.marks_obtained is None:
            return None
        return round((self.marks_obtained / self.assignment.total_marks) * 100, 2)
    
    def save(self, *args, **kwargs):
        if self.is_late:
            self.status = "late"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.assignment.title} - {self.student}"
    

