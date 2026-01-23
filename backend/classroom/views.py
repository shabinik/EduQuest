from django.shortcuts import render
from rest_framework.views import APIView 
from accounts.permissions import IsAdmin,HasActiveSubscription,IsTeacher
from . serializers import ClassSerializer,SubjectSerializer,TimeSlotSerializer,TimeTableSerializer,TimeTableEntrySerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status,viewsets, exceptions
from . models import SchoolClass,Subject,TimeSlot,TimeTable,TimeTableEntry
from rest_framework import generics 
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404 

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
    


class BaseTenantViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that handles:
    1. Tenant filtering (data isolation)
    2. Tenant assignment on creation
    3. Global Permission checks (Auth, Admin role, Subscription status)
    """

    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]
     
    def get_queryset(self):
        return self.queryset.filter(tenant = self.request.user.tenant)
    
    def perform_create(self, serializer):
        serializer.save(tenant = self.request.user.tenant)

    

class SubjectViewSet(BaseTenantViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]


class TimeSlotViewSet(BaseTenantViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer



class TimeTableViewSet(BaseTenantViewSet):
    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    @action(detail=False, methods=['get', 'post'], url_path='fetch-or-create')
    def get_by_class(self, request):
        tenant = request.user.tenant

        class_id = request.query_params.get('class_id') or request.data.get('class_id')

        if not class_id:
            return Response(
                {"error": "class id is requiered"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        school_class = get_object_or_404(SchoolClass, id=class_id,tenant=tenant)

        timetable, created = TimeTable.objects.get_or_create(
            tenant = tenant,
            school_class = school_class
        )

        serializer = self.get_serializer(timetable)
        return Response(serializer.data, status = status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def matrix(self, request, pk = None):
        # Returns the timetable data structured as a dictionary

        timetable = self.get_object()

        entries = timetable.entries.select_related('subject','teacher__user','slot').all()

        matrix_data = {}

        for entry in entries:
            day = entry.day
            slot_id = entry.slot.id

            if day not in matrix_data:
                matrix_data[day] = {}
            
            # This object matches what you need to show in the cell

            matrix_data[day][slot_id] = {
                "id" : entry.id,
                "subject" : entry.subject.name,
                "subject_id" : entry.subject.id,
                "teacher" : entry.teacher.user.full_name,
                "teacher_id" : entry.teacher.id,
                "start_time" : entry.slot.start_time,
                "end_time" : entry.slot.end_time
            }
        
        return Response(matrix_data)
    
    
            


class TimeTableEntryViewSet(BaseTenantViewSet):
    queryset = TimeTableEntry.objects.all()
    serializer_class = TimeTableEntrySerializer

    def get_queryset(self):

        queryset = super().get_queryset()
        timetable_id = self.request.query_params.get('timetable_id')

        if timetable_id:
            queryset = queryset.filter(timetable_id = timetable_id)

        return queryset

    @action(detail=False, methods=['post'], url_path='clear-timetable')
    def clear_timetable(self, request):
        """Removes all entries for a specific timetable grid."""
        timetable_id = request.data.get('timetable_id')

        if not timetable_id:
            return Response({"error": "timetable_id is required"}, status=400)
        
        deleted_count, _ = TimeTableEntry.objects.filter(
            tenant = request.user.tenant,
            timetable_id = timetable_id
        ).delete()
        return Response({
            "message": f"Cleared {deleted_count} entries.",
            "status": "success"
        }, status=status.HTTP_200_OK)
    

    
class StudentTimeTableView(APIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get(self, request):
        user = request.user

        if not hasattr(user, "student_profile"):
            return Response({"detail": "Student profile not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        student = user.student_profile
        tenant = user.tenant
        school_class = student.school_class

        if not school_class:
            return Response({"detail": "Student not assigned to class"}, status=400)

        timetable = get_object_or_404(TimeTable,tenant=tenant,school_class = school_class)
        
        if not timetable:
            return Response({
                "class_name": school_class.name,
                "division": school_class.division,
                "matrix": {}
            })

        
        slots = TimeSlot.objects.filter(tenant = tenant).order_by("start_time")

        matrix = {}
        
        if timetable:
            entries = timetable.entries.select_related(
                "subject", "teacher__user", "slot"
            )

            for entry in entries:
                matrix.setdefault(entry.day, {})[entry.slot.id] = {
                    "subject": entry.subject.name,
                    "teacher": entry.teacher.user.full_name,
                }

        return Response({
            "class_name" : school_class.name,
            "division": school_class.division,
            "slots": [
                {
                    "id": s.id,
                    "start_time": s.start_time,
                    "end_time": s.end_time,
                    "is_break": s.is_break,
                }
                for s in slots
            ],
            "matrix": matrix
        })
    


class TeacherTimeTableView(APIView):
    permission_classes = [IsAuthenticated, HasActiveSubscription,IsTeacher]

    def get(self, request):
        user = request.user
        tenant = user.tenant

        if not hasattr(user, "teacher_profile"):
            return Response(
                {"detail": "Teacher Profile not found"},
                status= status.HTTP_400_BAD_REQUEST
            )
        teacher = user.teacher_profile

        entries = (TimeTableEntry.objects
                   .filter(tenant = tenant,teacher = teacher, slot__is_break = False)
                   .select_related("subject", "slot", "timetable__school_class")
                   .order_by("day", "slot__start_time"))
        
        timetable = {}

        for entry in entries:
            timetable.setdefault(entry.day, []).append({
                "subject": entry.subject.name,
                "class_name": entry.timetable.school_class.name,
                "division": entry.timetable.school_class.division,
                "start_time": entry.slot.start_time,
                "end_time": entry.slot.end_time,
            })
 
        return Response({
            "teacher":user.full_name,
            "timetable":timetable
        })