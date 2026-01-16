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
from users.models import Student
from classroom.models import SchoolClass


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
            


