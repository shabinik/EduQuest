from django.shortcuts import render
from rest_framework.views import APIView 
from accounts.permissions import IsAdmin,HasActiveSubscription,IsTeacher
from . serializers import ClassSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from . models import SchoolClass

# Create your views here.

class CreateClassView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def post(self,request):
        serializer = ClassSerializer(data=request.data,context = {"request":request})

        if serializer.is_valid():
            class_obj = serializer.save() 
            return Response({
                "success":True,
                "class_id":class_obj.id,
                "message":"Class created successfully"
            },status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class ClassListView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get(self, request):
        classes = SchoolClass.objects.filter(tenant = request.user.tenant,is_active = True).select_related("class_teacher")

        data = []
        for c in classes:
            data.append({
                "id":c.id,
                "name":c.name,
                "division":c.division,
                "academic_year":c.academic_year,
                "max_student":c.max_student,
                "current_students": c.students.count(),
                "teacher":c.class_teacher.user.full_name if c.class_teacher else None
            })
        return Response(data)
    

class UpdateClassView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def put(self,request,class_id):
        try:
            class_obj = SchoolClass.objects.get(id = class_id, tenant = request.user.tenant,is_active = True)
        except SchoolClass.DoesNotExist:
            return Response({"detail":"Class not found"},status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClassSerializer(class_obj,data = request.data,partial = True, context = {"request":request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Class updated successfully"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DeleteClassView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def delete(self, request, class_id):
        try:
            class_obj = SchoolClass.objects.get(id = class_id, tenant = request.user.tenant, is_active = True)
        except SchoolClass.DoesNotExist:
            return Response({"detail": "Class not found"},status=status.HTTP_404_NOT_FOUND)
        
        if class_obj.students.exists():
            return Response(
                {"detail": "This class cannot be deactivated because students are assigned to it. "
                           "Please reassign the students to another class first."
                        },
                status=status.HTTP_400_BAD_REQUEST
            )

        class_obj.is_active = False
        class_obj.save()

        return Response(
            {"success": True, "message": "Class deactivated successfully"},
            status=status.HTTP_200_OK
        )



class ClassDropdownView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get(self, request):
        classes = SchoolClass.objects.filter(
            tenant=request.user.tenant,
            is_active=True
        ).order_by("name", "division")

        return Response([
            {
                "id": c.id,
                "label": f"{c.name}-{c.division} ({c.academic_year})",
                "max_student": c.max_student,
                "current_students": c.students.count(),
            }
            for c in classes
        ])


class ClassDetailView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get(self, request, class_id):
        try:
            school_class = ( SchoolClass.objects
                .select_related("class_teacher__user")
                .prefetch_related("students__user")
                .get(id = class_id,tenant = request.user.tenant, is_active = True)
            )
        except SchoolClass.DoesNotExist:
            return Response({"details":"Class not Found"},status=status.HTTP_404_NOT_FOUND)
        
        return Response ({
            "id":school_class.id,
            "name": school_class.name,
            "division":school_class.division,
            "academic_year":school_class.academic_year,
            "max_student":school_class.max_student,
            "current_students": school_class.students.count(),
            "class_teacher":(
                {
                    "id":school_class.class_teacher.id,
                    "name":school_class.class_teacher.user.full_name,
                    "email":school_class.class_teacher.user.email,
                }
                if school_class.class_teacher else None
            ),
            "students": [
                {
                    "id": s.id,
                    "name": s.user.full_name,
                    "email": s.user.email,
                    "roll_number": s.roll_number,
                }
                for s in school_class.students.all()
            ]
        })
    
class TeacherClassView(APIView):
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get(self,request):
        teacher = request.user.teacher_profile

        school_class = (SchoolClass.objects
                    .select_related("class_teacher__user")
                    .prefetch_related("students__user")
                    .filter(class_teacher = teacher, is_active = True).first())
        
        if not school_class:
            return Response({"details":"No class assigned"},status=404)
        
        return Response({
             "id": school_class.id,
            "name": school_class.name,
            "division": school_class.division,
            "academic_year": school_class.academic_year,
            "student_count": school_class.students.count(),
            "students": [
                {
                    "id": s.id,
                    "name": s.user.full_name,
                    "roll_number": s.roll_number,
                    "email": s.user.email
                }
                for s in school_class.students.all()
            ]
         })