from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.


class Exam(models.Model):
    """
    Teacher creates exams for specific classes
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    tenant = models.ForeignKey('accounts.Tenant', on_delete=models.CASCADE, related_name='exams')
    teacher = models.ForeignKey('users.Teacher', on_delete=models.CASCADE, related_name='exams')
      # Exam details
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    subject = models.ForeignKey('classroom.Subject', on_delete=models.CASCADE, related_name='exams')
    classes = models.ManyToManyField('classroom.SchoolClass', related_name='exams')
    # Scheduling
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    # Location (optional)
    room = models.CharField(max_length=100, blank=True, null=True)

    max_marks = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-exam_date', '-start_time']

    def __str__(self):
        return f"{self.title} - {self.subject.name} ({self.exam_date})"
    
    @property
    def total_students(self):
        """Total students across all assigned classes"""
        from users.models import Student
        return Student.objects.filter(school_class__in=self.classes.all()).count()
    
    @property
    def results_submitted(self):
        """Number of results submitted"""
        return self.results.exclude(status='absent').count()
    
    def update_status(self):
        """Auto-update status based on date and time"""
        now = timezone.now()
        exam_datetime = timezone.make_aware(
            timezone.datetime.combine(self.exam_date, self.start_time)
        )
        exam_end_datetime = timezone.make_aware(
            timezone.datetime.combine(self.exam_date, self.end_time)
        )
        
        if self.status == 'cancelled':
            return
        
        if now < exam_datetime:
            self.status = 'scheduled'
        elif exam_datetime <= now < exam_end_datetime:
            self.status = 'ongoing'
        elif now >= exam_end_datetime:
            self.status = 'completed'
        
        self.save(update_fields=['status'])




class ExamResult(models.Model):
    """
    Student's exam result
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Grading'),
        ('graded', 'Graded'),
        ('absent', 'Absent'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name='exam_results')    
    marks_obtained = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Teacher's remarks
    remarks = models.TextField(blank=True)

    graded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('exam', 'student')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.user.full_name} - {self.exam.title}"
    
    @property
    def percentage(self):
        """Calculate percentage"""
        if self.marks_obtained is None:
            return None
        return round((self.marks_obtained / self.exam.max_marks) * 100, 2)
    
    @property
    def grade(self):
        """Calculate grade based on percentage"""
        if self.percentage is None:
            return None
        
        if self.percentage >= 90:
            return 'A+'
        elif self.percentage >= 80:
            return 'A'
        elif self.percentage >= 70:
            return 'B'
        elif self.percentage >= 60:
            return 'C'
        elif self.percentage >= 50:
            return 'D'
        else:
            return 'F'
    
    def save(self, *args, **kwargs):
        if self.marks_obtained is not None and self.status == 'pending':
            self.status = 'graded'
            self.graded_at = timezone.now()
        super().save(*args, **kwargs)



class ExamConcern(models.Model):
    """
    Student raises concern about their exam result
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    result = models.ForeignKey(ExamResult, on_delete=models.CASCADE, related_name='concerns')
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name='exam_concerns')
    
    concern_text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Teacher's response
    response = models.TextField(blank=True)
    reviewed_by = models.ForeignKey('users.Teacher', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_concerns') 
    # Mark changes (if any)
    previous_marks = models.FloatField(null=True, blank=True)
    revised_marks = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Concern by {self.student.user.full_name} - {self.result.exam.title}"
    
    def save(self, *args, **kwargs):
        # Store previous marks when concern is created
        if not self.pk and self.result.marks_obtained is not None:
            self.previous_marks = self.result.marks_obtained
        
        # Update result if marks are revised
        if self.revised_marks is not None and self.status == 'resolved':
            self.result.marks_obtained = self.revised_marks
            self.result.graded_at = timezone.now()
            self.result.save()
        
        super().save(*args, **kwargs)