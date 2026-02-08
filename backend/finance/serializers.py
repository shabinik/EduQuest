from rest_framework import serializers
from . models import FeeType,FeeStructure,StudentBill,Payment,ExpenseCategory, Expense
from django.db.models import Sum
from decimal import Decimal

class FeeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeType
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class FeeStructureSerializer(serializers.ModelSerializer):
    fee_type_name = serializers.CharField(source='fee_type.name', read_only=True)
    class_names = serializers.SerializerMethodField()
    academic_years = serializers.ReadOnlyField()
    
    class Meta:
        model = FeeStructure
        fields = [
            'id', 'fee_type', 'fee_type_name', 'amount', 
            'school_classes', 'class_names', 'academic_years',
            'due_date', 'billing_period', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at','academic_years']
    
    def get_class_names(self, obj):
        """Return list of class names"""
        return [str(c) for c in obj.school_classes.all()]

    def create(self, validated_data):
        """Handle M2M and auto-generate bills"""
        classes = validated_data.pop('school_classes', [])
        fee_structure = FeeStructure.objects.create(**validated_data)
        fee_structure.school_classes.set(classes)
        fee_structure.generate_bills_for_students()
        return fee_structure
    
    def update(self, instance, validated_data):
        classes = validated_data.pop('school_classes', None)
        instance = super().update(instance, validated_data)
        
        if classes is not None:
            instance.school_classes.set(classes)
            instance.generate_bills_for_students()
        
        return instance
    


class StudentBillListSerializer(serializers.ModelSerializer):
    """For list views - minimal data"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    fee_type = serializers.CharField(source='fee_structure.fee_type.name', read_only=True)
    is_paid = serializers.SerializerMethodField()

    class Meta:
        model = StudentBill
        fields = [
            'id', 'student_name', 'admission_number', 'fee_type',
            'amount', 'due_date', 'paid_date', 'status', 'is_paid', 'created_at'
        ]

    def get_is_paid(self, obj):
        return obj.status == 'paid'
    

class PaymentSerializer(serializers.ModelSerializer):
    bill_details = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model = Payment
        fields = [
            'id', 'bill', 'bill_details', 'amount', 'payment_method', 
            'transaction_id', 'receipt_number', 'payment_date', 
            'notes', 'collected_by'
        ]
        read_only_fields = ['id', 'receipt_number', 'collected_by']
    

    def get_bill_details(self, obj):
        return {
            'student_name':obj.bill.student.user.full_name,
            'admission_number':obj.bill.student.admission_number,
            'fee_type': obj.bill.fee_structure.fee_type.name
        }
    
    def validate(self, data):
        bill = data.get('bill')
        amount = data.get('amount')

        if bill and amount:
            if amount != bill.amount:
                raise serializers.ValidationError(
                    f"Payment amount ₹{amount} must match bill amount ₹{bill.amount}. Full payment required."
                )
            
        # Check if bill is already paid
        if bill:
            try:
                if bill.payment:
                    raise serializers.ValidationError(
                        f"Bill is already paid. Receipt: {bill.payment.receipt_number}"
                    )
            except Payment.DoesNotExist:
                pass  # Bill is not paid yet, this is fine
        
        return data
    
    def create(self, validated_data):
        """Set collected_by to current user"""
        validated_data['collected_by'] = self.context['request'].user
        return super().create(validated_data)
    


class StudentBillDetailSerializer(serializers.ModelSerializer):
    """For detail view - includes payment if exists"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    fee_type = serializers.CharField(source='fee_structure.fee_type.name', read_only=True)
    class_name = serializers.CharField(source='student.school_class.__str__', read_only=True)
    billing_period = serializers.CharField(source='fee_structure.billing_period', read_only=True)
    payment = PaymentSerializer(read_only=True)  # OneToOne relationship
    is_paid = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentBill
        fields = [
            'id', 'student_name', 'admission_number', 'class_name',
            'fee_type', 'billing_period', 'amount', 'due_date', 'paid_date', 
            'status', 'is_paid', 'notes', 'payment', 'created_at', 'updated_at'
        ]
    
    def get_is_paid(self, obj):
        return obj.status == 'paid'
    



# SCHOOL EXPENSE 

class ExpenseCategorySerializer(serializers.ModelSerializer):
    expense_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'is_active', 'expense_count', 'total_amount', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_expense_count(self, obj):
        """Get count of expenses in this category"""
        return obj.expenses.filter(payment_status='paid').count()

    def get_total_amount(self, obj):
        """Get total amount spent in this category"""
        total = obj.expenses.filter(payment_status='paid').aggregate(
            total=Sum('amount')
        )['total']
        return float(total) if total else 0.0


class ExpenseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    month_year = serializers.ReadOnlyField()

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_name', 'title', 'amount', 
            'expense_date', 'payment_date', 'payment_method', 'payment_status',
            'month_year', 'created_by_name', 'created_at'
        ]


class ExpenseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all fields and relationships"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    month_year = serializers.ReadOnlyField()

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_name', 'title',
            'amount', 'expense_date', 'payment_date', 'payment_method',
            'payment_status', 'is_approved', 'approved_by', 'approved_by_name',
            'created_by', 'created_by_name', 'notes', 'month_year',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating expenses"""

    class Meta:
        model = Expense
        fields = [
            'category', 'title', 'amount',
            'expense_date', 'payment_date', 'payment_method',
            'payment_status', 'is_approved', 'approved_by', 'notes'
        ]

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, data):
        """Custom validation"""
        # If payment status is paid, payment_date should be set
        if data.get('payment_status') == 'paid' and not data.get('payment_date'):
            data['payment_date'] = data.get('expense_date')
        
        return data

    def create(self, validated_data):
        """Set created_by to current user"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseSummarySerializer(serializers.Serializer):
    """Serializer for expense summary statistics"""
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_pending = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count = serializers.IntegerField()
    paid_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    monthly_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    yearly_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    category_breakdown = serializers.ListField()


class MonthlyBreakdownSerializer(serializers.Serializer):
    """Serializer for monthly expense breakdown"""
    month = serializers.DateField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    month_name = serializers.CharField()


class CategoryBreakdownSerializer(serializers.Serializer):
    """Serializer for category-wise breakdown"""
    category__name = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    percentage = serializers.FloatField()