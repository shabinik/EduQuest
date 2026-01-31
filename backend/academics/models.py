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
    

# ----------- Attendance ------------

class ClassDailyAttendance(models.Model):
    """
    Represents daily attendance for a class
    """
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE,related_name="daily_attendances")
    school_class = models.ForeignKey("classroom.SchoolClass", on_delete=models.CASCADE,related_name="daily_attendances")
    date = models.DateField()
    marked_by = models.ForeignKey("users.Teacher", on_delete=models.SET_NULL, null=True,blank=True)
    is_completed = models.BooleanField(default=False)
    marked_at = models.DateTimeField(null=True, blank=True)

    # cached fields (optional but supported)
    total_students = models.PositiveIntegerField(default=0)
    present_count = models.PositiveIntegerField(default=0)
    absent_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("school_class", "date")

    def calculate_stats(self):
        """
        Calculate attendance statistics from StudentDailyAttendance
        """
        records = self.student_attendances.all()

        self.total_students = records.count()
        self.present_count = records.filter(status="present").count()
        self.absent_count = records.filter(status="absent").count()

        self.save(update_fields=[
            "total_students",
            "present_count",
            "absent_count",
            "updated_at"
        ])



class StudentDailyAttendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("leave", "Leave"),
    ]

    class_attendance = models.ForeignKey(ClassDailyAttendance,on_delete=models.CASCADE,related_name="student_attendances")
    student = models.ForeignKey("users.Student",on_delete=models.CASCADE,related_name="daily_attendances")
    status = models.CharField(max_length=10,choices=STATUS_CHOICES,default="present")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("class_attendance", "student")

    def __str__(self):
        return f"{self.student} - {self.status}"
    


class MonthlyAttendanceSummary(models.Model):
    """
    Monthly summary of student attendance
    """
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="attendance_summary")
    student = models.ForeignKey("users.Student",on_delete=models.CASCADE,related_name="attendance_summary")
    school_class = models.ForeignKey("classroom.SchoolClass",on_delete=models.CASCADE)

    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()

    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)

    attendance_percentage = models.DecimalField(max_digits=5,decimal_places=2,default=0.00)

    last_calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "month", "year")

    def calculate_percentage(self):
        """
        Calculate attendance percentage safely
        """
        if self.total_days > 0:
            percentage = (self.present_days / self.total_days) * 100
        else:
            percentage = 0.00

        self.attendance_percentage = round(percentage, 2)
        self.save()


    def __str__(self):
        return f"{self.student} - {self.month}/{self.year}"

    