from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin,IsTeacher,HasActiveSubscription
from . serializers import AnnouncementSerializer,ClassDailyAttendanceSerializer,StudentDailyAttendanceSerializer,AttendanceMarkSerializer,MonthlyAttendanceSummarySerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from . models import Announcement,StudentDailyAttendance,ClassDailyAttendance,MonthlyAttendanceSummary
from rest_framework import generics 
from django.db import transaction
from datetime import datetime, timedelta
from django.db.models import Q
from users.models import Student
from django.shortcuts import get_object_or_404
from classroom.models import SchoolClass

# Create your views here.

class CreateAnnouncement(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]
    
    def post(self,request):
        serializer = AnnouncementSerializer(data = request.data,context = {'request':request})
        if serializer.is_valid():
            announcement = serializer.save()
            return Response(
                {
                   "success":True,
                   "message":"Announcement Created Successfull",
                   "id" : announcement.id
                },status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class AnnouncementAudienceView(APIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get(self,request):
        user = request.user
        tenant = user.tenant
        now = timezone.now()

        qs = Announcement.objects.filter(
            tenant = tenant,
            expiry_date__gte = now
        ).order_by('-created_at')

        if user.role == 'teacher':
            qs = qs.filter(target_audience__in = ['all','teacher'])
        elif user.role == 'student':
            qs = qs.filter(target_audience__in = ['all','students'])
        
        data = [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "attachment": a.attachment,
                "audience": a.target_audience,
                "expiry_date": a.expiry_date,
                "created_at": a.created_at,
            }
            for a in qs
        ]

        return Response(data)
    

class AdminAnnouncementList(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get(self, request):
        tenant = request.user.tenant
        announcements = (
            Announcement.objects.filter(tenant = tenant)
            .order_by("-created_at")
        )

        data = [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "attachment": a.attachment,
                "target_audience": a.target_audience,
                "expiry_date": a.expiry_date,
                "is_active": a.expiry_date > timezone.now(),
                "created_at": a.created_at,
            }
            for a in announcements
        ]

        return Response(data)


class AdminAnnouncementUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get_queryset(self):
        return Announcement.objects.filter(tenant = self.request.user.tenant)
    

    
    
# -------------- ATTENDANCE --------------

class TeacherAttendanceListView(generics.ListAPIView):
    """List all attendance records for teacher's classes"""

    serializer_class = ClassDailyAttendanceSerializer
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]

    def get_queryset(self):
        teacher = self.request.user.teacher_profile
        queryset = ClassDailyAttendance.objects.filter(
            tenant = self.request.user.tenant,
            school_class__class_teacher = teacher
        ).select_related(
            'school_class', 'marked_by__user'
        ).prefetch_related('student_attendances__student__user')

        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date = date)

        return queryset.order_by('-date')
    


class TeacherMarkAttendanceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsTeacher,HasActiveSubscription]
    serializer_class = AttendanceMarkSerializer

    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        data = serializer.validated_data
        teacher = request.user.teacher_profile

        try:
            with transaction.atomic():
                class_attendance, created = ClassDailyAttendance.objects.get_or_create(
                    tenant = request.user.tenant,
                    school_class_id = data['school_class'],
                    date = data['date'],
                    defaults= {
                        'marked_by':teacher,
                        'is_completed': True,
                        'marked_at':timezone.now()
                    }
                )

                # Clear existing student attendance if updating
                if not created:
                    class_attendance.student_attendances.all().delete()
                    class_attendance.marked_by = teacher
                    class_attendance.is_completed = True
                    class_attendance.marked_at = timezone.now()
                    class_attendance.save()

                for item in data['attendance_data']:
                    StudentDailyAttendance.objects.create(
                        class_attendance = class_attendance,
                        student_id = item['student_id'],
                        status = item['status']
                    )
                
                # Calculate statistics
                class_attendance.calculate_stats()

                # Update monthly summary
                update_monthly_summary(
                    class_attendance.school_class,
                    data['date'].month,
                    data['date'].year,
                    request.user.tenant
                )

                return Response({
                    'message': 'Attendance marked successfully',
                    'attendance_id': class_attendance.id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
def update_monthly_summary(school_class, month, year,tenant):
    """Update monthly attendance summary for all students in class"""
    students = Student.objects.filter(school_class=school_class)

    for student in students:
        attendances = StudentDailyAttendance.objects.filter(
            student = student,
            class_attendance__date__month = month,
            class_attendance__date__year = year
        )

        total_days = attendances.count()
        present_days = attendances.filter(status='present').count()
        absent_days = attendances.filter(status='absent').count()

        summary, created = MonthlyAttendanceSummary.objects.update_or_create(
            tenant = tenant,
            student = student,
            school_class = school_class,
            month = month,
            year = year,
            defaults= {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days
            }
        )
        summary.calculate_percentage()



        
class TeacherGetClassStudentsView(generics.GenericAPIView):
    """Get all students in teacher's class for attendance marking"""
    permission_classes = [IsAuthenticated, IsTeacher,HasActiveSubscription]

    def get(self,request):
        teacher = request.user.teacher_profile
        tenant = request.user.tenant
        class_id = request.query_params.get('class_id')
        date = request.query_params.get('date')

        if not class_id:
            return Response(
                {'error': 'class_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get students in the class
        school_class = get_object_or_404(SchoolClass, id = class_id, class_teacher = teacher, tenant = tenant)

        students = Student.objects.filter(
            school_class = school_class,
            user__tenant = request.user.tenant
        ).select_related('user').order_by('roll_number')
        
        #Check if attendance already exists for this date
        existing_attendance = None
        if date:
            try:
                existing_attendance = ClassDailyAttendance.objects.get(
                    school_class = school_class,
                    date = date
                )
            except ClassDailyAttendance.DoesNotExist:
                pass

        student_data = []
        for student in students:
            status_value = 'present'  # Default

            if existing_attendance:
                try:
                    record = StudentDailyAttendance.objects.get(
                        class_attendance = existing_attendance,
                        student = student
                    )
                    status_value = record.status
                except StudentDailyAttendance.DoesNotExist:
                    pass

            student_data.append({
                'id': student.id,
                'name': student.user.full_name,
                'roll_number': student.roll_number,
                'status': status_value
            })

        return Response({
            'students': student_data,
            'is_editing': existing_attendance is not None,
            'attendance_id': existing_attendance.id if existing_attendance else None
        })
    


class TeacherAttendanceDetailView(generics.RetrieveAPIView):
    """View detailed attendance record"""
    serializer_class = ClassDailyAttendanceSerializer
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]
    
    def get_queryset(self):
        return ClassDailyAttendance.objects.filter(
            tenant=self.request.user.tenant,
            school_class__class_teacher=self.request.user.teacher_profile
        ).select_related('school_class', 'marked_by__user').prefetch_related('student_attendances__student__user')
    


class StudentAttendanceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get(self, request):
        student = request.user.student_profile
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)
        
        # Get daily attendance records
        daily_records = StudentDailyAttendance.objects.filter(
            student = student,
            class_attendance__date__month = month,
            class_attendance__date__year = year
        ).select_related('class_attendance').order_by('class_attendance__date')

        # Get monthly summary
        try:
            summary = MonthlyAttendanceSummary.objects.get(
                student=student,
                month=month,
                year=year
            )
            summary_data = MonthlyAttendanceSummarySerializer(summary).data
        except MonthlyAttendanceSummary.DoesNotExist:
            summary_data = None

        daily_data = []
        for record in daily_records:
            daily_data.append({
                'date': record.class_attendance.date,
                'status': record.status,
                'day_of_week': record.class_attendance.date.strftime('%A')
            })

        return Response({
            'summary': summary_data,
            'daily_attendance': daily_data
        })
    

class StudentMonthlyReportView(generics.ListAPIView):
    """Monthly attendance report for students"""
    serializer_class = MonthlyAttendanceSummarySerializer
    permission_classes = [IsAuthenticated, HasActiveSubscription]

    def get_queryset(self):
        return MonthlyAttendanceSummary.objects.filter(
            student = self.request.user.student_profile
        ).order_by('-year', '-month')



            

