from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import TeacherCreateSerializer,TeacherProfileSerializer,StudentCreateSerializer,StudentListSerializer,StudentProfileSerializer
from accounts.permissions import IsAdmin
from . models import Teacher,Student


# Create your views here.

class CreateTeacherView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

    def post(self, request):
        serializer = TeacherCreateSerializer(data = request.data, context={'request':request})
        if serializer.is_valid():
            teacher = serializer.save()
            return Response({"success": True, "teacher_id": teacher.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherListView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

    def get(self,request):
        qs = Teacher.objects.filter(user__tenant = request.user.tenant).select_related('user')
        data = []
        for t in qs:
            data.append({
                'id':t.id,
                'email':t.user.email,
                'full_name':t.user.full_name,
                'qualification':t.qualification,
                'joining_date':t.joining_date,
            })
        return Response(data)
    

class DeleteTeacherView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

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
    permission_classes = [IsAuthenticated,IsAdmin]

    def post(self,request):
        serializer = StudentCreateSerializer(data = request.data,context={"request":request})
        if serializer.is_valid():
            student = serializer.save()
            return Response(StudentListSerializer(student).data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=400)
    


class StudentListView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

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
    


class DeleteStudentView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]

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
            


