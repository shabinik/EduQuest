from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ( TeacherCreateSerializer,TeacherProfileSerializer,
                          StudentCreateSerializer,StudentListSerializer,StudentProfileSerializer,StudentDetailSerializer
)
from accounts.permissions import IsAdmin,HasActiveSubscription
from . models import Teacher,Student
from subscription.models import Subscription
from classroom.models import SchoolClass, TimeTable, TimeTableEntry


from django.utils import timezone
from datetime import timedelta, date
from academics.models import Announcement,ClassDailyAttendance, StudentDailyAttendance,MonthlyAttendanceSummary
from exam.models import Exam, ExamResult
from assignment.models import Assignment,AssignmentSubmission
from finance.models import StudentBill
 

# Create your views here.

class CreateTeacherView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def post(self, request):
        serializer = TeacherCreateSerializer(data = request.data, context={'request':request})
        if serializer.is_valid():
            teacher = serializer.save()
            return Response({"success": True, "teacher_id": teacher.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherListView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get(self,request):
        qs = Teacher.objects.filter(user__tenant = request.user.tenant).select_related('user')
        data = []
        for t in qs:
            data.append({
                "id": t.id,
                "full_name": t.user.full_name,
                "email": t.user.email,
                "phone": t.user.phone,
                "gender": t.user.gender,
                "DOB": t.user.DOB,
                "profile_image": t.user.profile_image,
                "qualification": t.qualification,
                "salary": t.salary,
                "joining_date": t.joining_date,
            })
        return Response(data)
    

class UpdateTeacherView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def put(self, request, teacher_id):
        try:
            teacher = Teacher.objects.select_related("user").get(
                id = teacher_id, user__tenant = request.user.tenant
            )
        except Teacher.DoesNotExist:
            return Response({"detail": "Teacher not found"}, status=404)
    
        user = teacher.user
        data = request.data

        user.full_name = data.get("full_name",user.full_name)
        user.phone = data.get("phone",user.phone)
        user.save()

        teacher.qualification = data.get("qualification", teacher.qualification)
        teacher.joining_date = data.get("joining_date", teacher.joining_date)
        teacher.salary = data.get("salary", teacher.salary)
        teacher.save() 

        return Response({"success": True})

class DeleteTeacherView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def delete(self,request,teacher_id):
        try:
            teacher = Teacher.objects.select_related("user").get(
                id=teacher_id,user__tenant = request.user.tenant
            )
        except Teacher.DoesNotExist:
            return Response(
                {"detail": "Teacher not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        teacher.user.delete()
        return Response({"details":"Teacher deleted Successfully"},status=200)



class TeacherProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        if user.role != "teacher":
            return Response({"detail": "Not a teacher"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            teacher = user.teacher_profile
        except Teacher.DoesNotExist:
            return Response({"detail": "Teacher profile not found"}, status=404)
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data)
    
    def put(self,request):
        user = request.user
        if user.role != "teacher":
            return Response({"detail": "Not a teacher"}, status=status.HTTP_403_FORBIDDEN)
        teacher = request.user.teacher_profile
        serializer = TeacherProfileSerializer(teacher,data = request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    


class CreateStudentView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def post(self,request):
        tenant = request.user.tenant
        serializer = StudentCreateSerializer(data = request.data,context={"request":request})
        subscription = Subscription.objects.filter(tenant = tenant).order_by("-start_date").first()
        max_students = subscription.plan.max_students
        current_count = Student.objects.filter(user__tenant = tenant).count()
        if max_students < current_count:
            return Response({"detail": f"Student limit reached ({max_students}). Upgrade plan."},status=400)
        
        if serializer.is_valid():
            student = serializer.save()
            return Response(StudentListSerializer(student).data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=400)
    


class StudentListView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get(self,request):
        tenant = request.user.tenant
        students = Student.objects.filter(user__tenant = tenant)
        serializer = StudentListSerializer(students,many=True)
        return Response(serializer.data)
    


class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        if request.user.role != "student":
            return Response({"detail": "Not a student"}, status=403)
        
        student = request.user.student_profile
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)
    
    def put(self,request):
        if request.user.role != "student":
            return Response({"detail": "Not a student"}, status=403)
        
        student = request.user.student_profile
        serializer = StudentProfileSerializer(student, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    


class UpdateStudentView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def put(self, request, student_id):
        try:
            student = Student.objects.select_related("user","school_class").get(
                id = student_id,
                user__tenant = request.user.tenant
            )
        except Student.DoesNotExist:
            return Response({"details":"Student not found"},status=404)
        
        user = student.user
        data = request.data
        user.full_name = data.get("full_name", user.full_name)
        user.phone = data.get("phone", user.phone)
        user.save()

        student.guardian_name = data.get("guardian_name", student.guardian_name)
        student.guardian_contact = data.get("guardian_contact", student.guardian_contact)
        student.roll_number = data.get("roll_number", student.roll_number)
        new_class_id = data.get("school_class")

        if new_class_id:
            try:
                new_class = SchoolClass.objects.get(
                    id=new_class_id,
                    tenant = request.user.tenant,
                    is_active = True
                )
            except SchoolClass.DoesNotExist:
                return Response({"detail": "Invalid class selected"},status=status.HTTP_400_BAD_REQUEST)
            
            if (student.school_class != new_class and new_class.students.count() >= new_class.max_student):
                return Response(
                    {"detail": f"Class capacity reached ({new_class.max_student})"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            student.school_class = new_class
            
        student.save()

        return Response({"success":True})


class AdminStudentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin,HasActiveSubscription]

    def get(self, request, student_id):
        try:
            student = Student.objects.select_related("user").get(
                id=student_id,
                user__tenant=request.user.tenant
            )
        except Student.DoesNotExist:
            return Response({"detail": "Student not found"}, status=404)

        serializer = StudentDetailSerializer(student)
        return Response(serializer.data)



class DeleteStudentView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def delete(self, request,student_id):
        try:
            student = Student.objects.select_related("user").get(
                id = student_id,user__tenant = request.user.tenant
            )
        except Student.DoesNotExist:
            return Response(
                {"details":"Student not Exist"},status=status.HTTP_404_NOT_FOUND)
        
        student.user.delete()
        return Response({"details":"Student deleted Successfully"},status=200)
            



class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "teacher":
            return Response({"detail": "Forbidden"}, status=403)

        teacher = request.user.teacher_profile
        tenant  = request.user.tenant
        now     = timezone.now()
        today   = now.date()

        # ── My class (as class teacher) ──
        my_class = (
            SchoolClass.objects
            .filter(class_teacher=teacher, is_active=True, tenant=tenant)
            .first()
        )

        my_class_info = None
        today_attendance = None

        if my_class:
            student_count = my_class.students.count()
            my_class_info = {
                "id":           my_class.id,
                "name":         str(my_class),
                "student_count": student_count,
            }

            # Today's attendance for my class
            att = ClassDailyAttendance.objects.filter(
                school_class=my_class,
                date=today,
                tenant=tenant,
            ).first()

            if att:
                today_attendance = {
                    "is_completed":   att.is_completed,
                    "present_count":  att.present_count,
                    "absent_count":   att.absent_count,
                    "total_students": att.total_students,
                    "attendance_pct": round(
                        (att.present_count / att.total_students * 100) if att.total_students else 0, 1
                    ),
                }
            else:
                today_attendance = {
                    "is_completed":   False,
                    "present_count":  0,
                    "absent_count":   0,
                    "total_students": student_count,
                    "attendance_pct": 0,
                }

        # ── Exams ───
        my_exams = Exam.objects.filter(teacher=teacher, tenant=tenant)

        upcoming_exams = (
            my_exams
            .filter(exam_date__gte=today, status__in=["scheduled", "ongoing"])
            .order_by("exam_date", "start_time")[:5]
        )
        upcoming_exams_list = [
            {
                "id":         e.id,
                "title":      e.title,
                "subject":    e.subject.name,
                "exam_date":  e.exam_date.strftime("%d %b %Y"),
                "start_time": e.start_time.strftime("%I:%M %p"),
                "max_marks":  e.max_marks,
                "status":     e.status,
                "classes":    [str(c) for c in e.classes.all()],
            }
            for e in upcoming_exams
        ]

        # Exams needing grading (completed but has pending results)
        pending_grading = (
            my_exams
            .filter(status="completed")
            .filter(results__status="pending")
            .distinct()
            .count()
        )

        exams_this_month = my_exams.filter(
            exam_date__year=now.year,
            exam_date__month=now.month,
        ).count()

        total_exams = my_exams.count()

        # ── Assignments ───
        my_assignments = Assignment.objects.filter(teacher=teacher, tenant=tenant)

        # Pending review (submitted but not graded)
        pending_review_count = AssignmentSubmission.objects.filter(
            assignment__teacher=teacher,
            assignment__tenant=tenant,
            status__in=["submitted", "late"],
        ).count()

        active_assignments = my_assignments.filter(due_date__gte=now).count()
        overdue_assignments = my_assignments.filter(due_date__lt=now).count()

        recent_assignments = (
            my_assignments
            .prefetch_related("classes")
            .select_related("subject")
            .order_by("-created_at")[:5]
        )
        recent_assignments_list = [
            {
                "id":          a.id,
                "title":       a.title,
                "subject":     a.subject.name,
                "due_date":    a.due_date.strftime("%d %b %Y, %I:%M %p"),
                "total_marks": a.total_marks,
                "submissions": a.submissions.count(),
                "is_overdue":  a.is_overdue,
                "classes":     [str(c) for c in a.classes.all()],
            }
            for a in recent_assignments
        ]

        # ── Subjects I teach ───
        subjects_taught = (
            my_exams
            .values_list("subject__name", flat=True)
            .distinct()
        )
        subjects_list = list(subjects_taught)

        # ── Announcements (for teachers) ──
        announcements = (
            Announcement.objects
            .filter(
                tenant=tenant,
                expiry_date__gte=now,
                target_audience__in=["all", "teachers"],
            )
            .order_by("-created_at")[:5]
        )
        announcements_list = [
            {
                "id":          a.id,
                "title":       a.title,
                "description": a.description,
                "audience":    a.target_audience,
                "expiry_date": a.expiry_date.strftime("%d %b %Y"),
                "created_at":  a.created_at.strftime("%d %b %Y"),
            }
            for a in announcements
        ]

        # ── Attendance trend (last 7 school days for my class) ───
        attendance_trend = []
        if my_class:
            last_7 = (
                ClassDailyAttendance.objects
                .filter(
                    school_class=my_class,
                    tenant=tenant,
                    is_completed=True,
                    date__gte=today - timedelta(days=14),
                )
                .order_by("date")[:7]
            )
            attendance_trend = [
                {
                    "date":    a.date.strftime("%d %b"),
                    "present": a.present_count,
                    "absent":  a.absent_count,
                    "pct":     round(
                        (a.present_count / a.total_students * 100)
                        if a.total_students else 0, 1
                    ),
                }
                for a in last_7
            ]

        return Response({
            "my_class":            my_class_info,
            "today_attendance":    today_attendance,
            "kpis": {
                "total_exams":        total_exams,
                "exams_this_month":   exams_this_month,
                "pending_grading":    pending_grading,
                "active_assignments": active_assignments,
                "pending_review":     pending_review_count,
                "overdue_assignments":overdue_assignments,
                "subjects_count":     len(subjects_list),
                "announcements_count":len(announcements_list),
            },
            "upcoming_exams":      upcoming_exams_list,
            "recent_assignments":  recent_assignments_list,
            "announcements":       announcements_list,
            "attendance_trend":    attendance_trend,
            "subjects":            subjects_list,
        })





class StudentDashboardView(APIView):
    """
    GET /api/academics/student/dashboard/
    Everything a student needs on their dashboard in one call.
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        if request.user.role != "student":
            return Response({"detail": "Forbidden"}, status=403)
 
        student = request.user.student_profile
        tenant  = request.user.tenant
        now     = timezone.now()
        today   = now.date()
 
        # ── Attendance ────────────────────────────────────────────────────────
        # This month's summary
        monthly_att = MonthlyAttendanceSummary.objects.filter(
            student=student,
            month=now.month,
            year=now.year,
        ).first()
 
        attendance_this_month = {
            "total_days":   monthly_att.total_days if monthly_att else 0,
            "present_days": monthly_att.present_days if monthly_att else 0,
            "absent_days":  monthly_att.absent_days if monthly_att else 0,
            "percentage":   float(monthly_att.attendance_percentage) if monthly_att else 0.0,
        }
 
        # Last 6 months trend
        att_trend = (
            MonthlyAttendanceSummary.objects
            .filter(student=student)
            .order_by("-year", "-month")[:6]
        )
        att_trend_list = [
            {
                "label":      f"{a.month}/{str(a.year)[2:]}",
                "percentage": float(a.attendance_percentage),
                "present":    a.present_days,
                "total":      a.total_days,
            }
            for a in reversed(list(att_trend))
        ]
 
        # Today's attendance status
        today_status = None
        today_att = StudentDailyAttendance.objects.filter(
            student=student,
            class_attendance__date=today,
        ).first()
        if today_att:
            today_status = today_att.status
 
        # ── Exams ─────────────────────────────────────────────────────────────
        if student.school_class:
            my_exams = Exam.objects.filter(
                classes=student.school_class,
                tenant=tenant,
            )
 
            upcoming_exams = (
                my_exams
                .filter(exam_date__gte=today, status__in=["scheduled", "ongoing"])
                .select_related("subject")
                .order_by("exam_date", "start_time")[:5]
            )
            upcoming_exams_list = [
                {
                    "id":         e.id,
                    "title":      e.title,
                    "subject":    e.subject.name,
                    "exam_date":  e.exam_date.strftime("%d %b %Y"),
                    "start_time": e.start_time.strftime("%I:%M %p"),
                    "end_time":   e.end_time.strftime("%I:%M %p"),
                    "max_marks":  e.max_marks,
                    "room":       e.room or "TBA",
                    "status":     e.status,
                }
                for e in upcoming_exams
            ]
 
            # Recent results
            recent_results = (
                ExamResult.objects
                .filter(student=student, status="graded")
                .select_related("exam__subject")
                .order_by("-graded_at")[:6]
            )
            recent_results_list = [
                {
                    "exam_title":  r.exam.title,
                    "subject":     r.exam.subject.name,
                    "marks":       r.marks_obtained,
                    "max_marks":   r.exam.max_marks,
                    "percentage":  r.percentage,
                    "grade":       r.grade,
                    "graded_at":   r.graded_at.strftime("%d %b") if r.graded_at else "—",
                }
                for r in recent_results
            ]
 
            # Average performance
            all_results = ExamResult.objects.filter(
                student=student, status="graded"
            )
            total_results = all_results.count()
            if total_results > 0:
                total_pct = sum(
                    r.percentage for r in all_results if r.percentage is not None
                )
                avg_percentage = round(total_pct / total_results, 1)
            else:
                avg_percentage = 0.0
 
        else:
            upcoming_exams_list = []
            recent_results_list = []
            avg_percentage = 0.0
            total_results = 0
 
        # ── Assignments ───────────────────────────────────────────────────────
        if student.school_class:
            my_assignments = Assignment.objects.filter(
                classes=student.school_class,
                tenant=tenant,
            ).select_related("subject").prefetch_related("classes")
 
            pending_assignments = my_assignments.filter(due_date__gte=now)
            overdue_assignments = my_assignments.filter(due_date__lt=now)
 
            # Which ones the student has already submitted
            submitted_ids = set(
                AssignmentSubmission.objects
                .filter(student=student)
                .values_list("assignment_id", flat=True)
            )
 
            pending_list = []
            for a in pending_assignments.order_by("due_date")[:5]:
                pending_list.append({
                    "id":          a.id,
                    "title":       a.title,
                    "subject":     a.subject.name,
                    "due_date":    a.due_date.strftime("%d %b %Y, %I:%M %p"),
                    "total_marks": a.total_marks,
                    "submitted":   a.id in submitted_ids,
                })
 
            # My submission results
            my_submissions = (
                AssignmentSubmission.objects
                .filter(student=student, status="graded")
                .select_related("assignment__subject")
                .order_by("-graded_at")[:5]
            )
            graded_submissions = [
                {
                    "title":       s.assignment.title,
                    "subject":     s.assignment.subject.name,
                    "marks":       s.marks_obtained,
                    "total_marks": s.assignment.total_marks,
                    "percentage":  s.percentage,
                    "feedback":    s.feedback[:100] if s.feedback else None,
                }
                for s in my_submissions
            ]
 
            pending_submit_count = sum(
                1 for a in pending_assignments if a.id not in submitted_ids
            )
        else:
            pending_list = []
            graded_submissions = []
            pending_submit_count = 0
 
        # ── Fees ──────────────────────────────────────────────────────────────
        my_bills = StudentBill.objects.filter(student=student, tenant=tenant)
        pending_bills = my_bills.filter(status="pending")
        overdue_bills = my_bills.filter(status="overdue")
 
        pending_fee_amount = sum(float(b.amount) for b in pending_bills)
        overdue_fee_amount = sum(float(b.amount) for b in overdue_bills)
 
        upcoming_dues = (
            my_bills
            .filter(status__in=["pending", "overdue"])
            .order_by("due_date")[:3]
        )
        fee_dues_list = [
            {
                "fee_type":  b.fee_structure.fee_type.name,
                "amount":    float(b.amount),
                "due_date":  b.due_date.strftime("%d %b %Y"),
                "status":    b.status,
            }
            for b in upcoming_dues
        ]
 
        # ── Today's timetable ─────────────────────────────────────────────────
        day_map = {0:"mon",1:"tue",2:"wed",3:"thu",4:"fri",5:"sat",6:"sun"}
        today_day = day_map.get(today.weekday(), "")
        today_schedule = []
 
        if student.school_class:
            timetable = TimeTable.objects.filter(
                school_class=student.school_class,
                tenant=tenant,
            ).first()
            if timetable and today_day:
                entries = (
                    TimeTableEntry.objects
                    .filter(timetable=timetable, day=today_day)
                    .select_related("slot", "subject", "teacher__user")
                    .order_by("slot__start_time")
                )
                today_schedule = [
                    {
                        "time":    f"{e.slot.start_time.strftime('%I:%M')}–{e.slot.end_time.strftime('%I:%M %p')}",
                        "subject": e.subject.name if e.subject else "Break",
                        "teacher": e.teacher.user.full_name if e.teacher else "—",
                        "is_break": e.slot.is_break,
                    }
                    for e in entries
                ]
 
        # ── Announcements ─────────────────────────────────────────────────────
        announcements = (
            Announcement.objects
            .filter(
                tenant=tenant,
                expiry_date__gte=now,
                target_audience__in=["all", "students"],
            )
            .order_by("-created_at")[:4]
        )
        announcements_list = [
            {
                "id":          a.id,
                "title":       a.title,
                "description": a.description,
                "audience":    a.target_audience,
                "expiry_date": a.expiry_date.strftime("%d %b %Y"),
                "created_at":  a.created_at.strftime("%d %b %Y"),
            }
            for a in announcements
        ]
 
        # ── Student info ──────────────────────────────────────────────────────
        student_info = {
            "name":             request.user.full_name,
            "admission_number": student.admission_number,
            "roll_number":      student.roll_number,
            "class_name":       str(student.school_class) if student.school_class else "—",
        }
 
        return Response({
            "student":             student_info,
            "attendance":          attendance_this_month,
            "today_status":        today_status,
            "att_trend":           att_trend_list,
            "upcoming_exams":      upcoming_exams_list,
            "recent_results":      recent_results_list,
            "avg_percentage":      avg_percentage,
            "total_results":       total_results,
            "pending_assignments": pending_list,
            "graded_submissions":  graded_submissions,
            "pending_submit_count": pending_submit_count,
            "fee_dues":            fee_dues_list,
            "pending_fee_amount":  pending_fee_amount,
            "overdue_fee_amount":  overdue_fee_amount,
            "today_schedule":      today_schedule,
            "announcements":       announcements_list,
        })