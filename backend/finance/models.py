from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from django.db.models import Sum

User = settings.AUTH_USER_MODEL

# Create your models here.

# Student Fees

class FeeType(models.Model):
    """What is being charged (Sports, Library, Tuition, etc.)"""
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="fee_types")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("tenant", "name")

    def __str__(self):
        return self.name
    



class FeeStructure(models.Model):
    """Who should pay, how much, and when"""
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="fee_structures")
    fee_type = models.ForeignKey(FeeType, on_delete=models.CASCADE, related_name="structures")
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    school_classes = models.ManyToManyField(
        "classroom.SchoolClass", 
        related_name="fee_structures",
        blank=True,
        help_text="Select multiple classes. Leave empty to apply to all students."
    )
    
    due_date = models.DateField()
    billing_period = models.CharField(max_length=50, blank=True, help_text="March 2026, Term 1, Annual, Exam Cycle")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        classes = self.school_classes.all()
        if classes.exists():
            class_names = ", ".join([str(c) for c in classes[:2]])
            if classes.count() > 2:
                class_names += f" +{classes.count() - 2} more"
            class_info = class_names
        else:
            class_info = "All Classes"
        return f"{self.fee_type.name} - ₹{self.amount} - {class_info} - {self.billing_period}"
    
    @property
    def academic_years(self):
        """Get unique academic years from selected classes"""
        return list(self.school_classes.values_list('academic_year', flat=True).distinct())

    def generate_bills_for_students(self):
        """Generate StudentBill for eligible students"""
        from users.models import Student
        
        classes = self.school_classes.all()
        
        if classes.exists():
            # Multiple specific classes
            students = Student.objects.filter(
                school_class__in=classes, 
                user__tenant=self.tenant
            )
        else:
            # All students in academic year
            students = Student.objects.filter(
                school_class__academic_year=self.academic_year,
                user__tenant=self.tenant
            )
        
        bills_created = 0
        for student in students:
            if not StudentBill.objects.filter(student=student, fee_structure=self).exists():
                StudentBill.objects.create(
                    tenant=self.tenant,
                    student=student,
                    fee_structure=self,
                    amount=self.amount,
                    due_date=self.due_date
                )
                bills_created += 1
        
        return bills_created




class StudentBill(models.Model):
    """Individual bill assigned to a student"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="student_bills")
    student = models.ForeignKey("users.Student", on_delete=models.CASCADE, related_name="bills")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name="bills")

    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "fee_structure")
        ordering = ['due_date']

    def __str__(self):
        return f"{self.student.admission_number} - {self.fee_structure.fee_type.name} - ₹{self.amount}"

    def update_status(self):
        """Update status based on payment existence"""
        try:
            if self.payment:
                self.status = 'paid'
                self.paid_date = self.payment.payment_date.date()
        except Payment.DoesNotExist:
            if timezone.now().date() > self.due_date:
                self.status = 'overdue'
            else:
                self.status = 'pending'
        self.save()


class Payment(models.Model):
    """Transaction record"""
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="fee_payments")
    bill = models.OneToOneField(StudentBill, on_delete=models.CASCADE, related_name="payment")
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    
    receipt_number = models.CharField(max_length=50, unique=True)
    
    collected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="collected_payments")
    payment_date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Receipt {self.receipt_number} - ₹{self.amount}"

    def save(self, *args, **kwargs):
        # Generate receipt number
        if not self.receipt_number:
            from django.utils.crypto import get_random_string
            year = timezone.now().year
            self.receipt_number = f"RCP-{year}-{get_random_string(8).upper()}"
        
        # Validate payment amount matches bill amount
        if self.amount != self.bill.amount:
            raise ValueError(f"Payment amount ₹{self.amount} must match bill amount ₹{self.bill.amount}")
        
        super().save(*args, **kwargs)
        
        # Update bill status
        self.bill.update_status()



# Schools Expense

class ExpenseCategory(models.Model):
    """Categories for expenses like Salary, Utilities, Maintenance, etc."""
    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="expense_categories")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("tenant", "name")
        ordering = ['name']
        verbose_name_plural = "Expense Categories"

    def __str__(self):
        return self.name


class Expense(models.Model):
    """Individual expense records"""
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    tenant = models.ForeignKey("accounts.Tenant", on_delete=models.CASCADE, related_name="expenses")
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name="expenses")
    title = models.CharField(max_length=200, help_text="Brief title of the expense")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    expense_date = models.DateField(default=timezone.now, help_text="Date when expense occurred")
    payment_date = models.DateField(null=True, blank=True, help_text="Date when payment was made")
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Approval workflow - vendor is the approving admin
    is_approved = models.BooleanField(default=True, help_text="If expense is approved")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_expenses", help_text="Admin who approved (vendor)")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_expenses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['tenant', 'expense_date']),
            models.Index(fields=['tenant', 'category']),
            models.Index(fields=['tenant', 'payment_status']),
        ]

    def __str__(self):
        return f"{self.title} - ₹{self.amount} ({self.expense_date})"

    @property
    def month_year(self):
        """Return formatted month-year string"""
        return self.expense_date.strftime('%B %Y')

    @classmethod
    def get_monthly_total(cls, tenant, year, month):
        """Get total expenses for a specific month"""
        return cls.objects.filter(
            tenant=tenant,
            expense_date__year=year,
            expense_date__month=month,
            payment_status='paid'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @classmethod
    def get_yearly_total(cls, tenant, year):
        """Get total expenses for a specific year"""
        return cls.objects.filter(
            tenant=tenant,
            expense_date__year=year,
            payment_status='paid'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @classmethod
    def get_category_totals(cls, tenant, year=None, month=None):
        """Get expense totals grouped by category"""
        queryset = cls.objects.filter(tenant=tenant, payment_status='paid')
        
        if year:
            queryset = queryset.filter(expense_date__year=year)
        if month:
            queryset = queryset.filter(expense_date__month=month)
        
        return queryset.values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')

    @classmethod
    def get_monthly_breakdown(cls, tenant, year):
        """Get month-by-month breakdown for a year"""
        from django.db.models.functions import TruncMonth
        
        return cls.objects.filter(
            tenant=tenant,
            expense_date__year=year,
            payment_status='paid'
        ).annotate(
            month=TruncMonth('expense_date')
        ).values('month').annotate(
            total=Sum('amount')
        ).order_by('month')
    
