from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction

from .models import Exam, ExamResult, ExamConcern
from .serializers import  ExamSerializer, ExamResultSerializer,ExamConcernSerializer, TeacherReviewConcernSerializer

from users.models import Student
from accounts.permissions import IsTeacher, HasActiveSubscription

# Create your views here.

# ==================== TEACHER VIEWS ====================

class TeacherExamListCreateView(generics.ListCreateAPIView):
    """List and create exams"""
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]
    
    def get_queryset(self):
        return Exam.objects.filter(
            tenant = self.request.user.tenant,
            teacher = self.request.user.teacher_profile
        ).prefetch_related('classes', 'subject').order_by('-exam_date')
    

class TeacherExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete exam"""
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]
    
    def get_queryset(self):
        return Exam.objects.filter(
            tenant=self.request.user.tenant,
            teacher=self.request.user.teacher_profile
        )
    

class TeacherExamResultsView(APIView):
    """Get all results for an exam"""
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get(self,request,exam_id):
        try:
            exam = Exam.objects.get(
                id = exam_id,
                teacher = request.user.teacher_profile
            )
        except Exam.DoesNotExist:
              return Response(
                {'error': 'Exam not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all students from assigned classes
        students = Student.objects.filter(
            school_class__in = exam.classes.all(),
            user__tenant = request.user.tenant
        ).select_related('user')

        # Get or create results
        results = []
        for student in students:
            result, created = ExamResult.objects.get_or_create(
                exam = exam,
                student = student
            )
            results.append(result)

        serializer = ExamResultSerializer(results,many = True)
        return Response(serializer.data)
    

class TeacherGradeResultView(generics.UpdateAPIView):
    """Grade a student's exam result"""
    serializer_class = ExamResultSerializer
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]

    def get_queryset(self):
        return ExamResult.objects.filter(
            exam__teacher = self.request.user.teacher_profile
        )
    

class StudentExamListView(generics.ListAPIView):
    """List exams for student's class"""
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, HasActiveSubscription]

    def get_queryset(self):
        student = self.request.user.student_profile
        return Exam.objects.filter(
            tenant = self.request.user.tenant,
            classes = student.school_class
        ).prefetch_related('classes','subject').order_by('-exam_date')
    

class StudentExamResultsView(generics.ListAPIView):
    serializer_class = ExamResultSerializer
    permission_classes = [IsAuthenticated, HasActiveSubscription]

    def get_queryset(self):
        return ExamResult.objects.filter(
            student = self.request.user.student_profile
        ).select_related('exam__subject', 'exam__teacher__user').order_by('-exam__exam_date')
    

# -------RAISE CONCERN-----------

class TeacherConcernListView(generics.ListAPIView):
    """List all concerns for teacher's exams"""
    serializer_class = ExamConcernSerializer
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]

    def get_queryset(self):
        return ExamConcern.objects.filter(
            result__exam__teacher = self.request.user.teacher_profile
        ).select_related('student__user', 'result__exam', 'reviewed_by__user')



class TeacherReviewConcernView(APIView):
    """Review and respond to a concern"""
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def post(self, request, concern_id):
        try:
            concern = ExamConcern.objects.get(
                id = concern_id,
                result__exam__teacher = request.user.teacher_profile
            )
        except ExamConcern.DoesNotExist:
            return Response(
                {'error': 'Concern not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TeacherReviewConcernSerializer(data = request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data

        with transaction.atomic():
            concern.status = data['status']
            concern.response = data['response']
            concern.reviewed_by = request.user.teacher_profile
            concern.reviewed_at = timezone.now()

            if data.get('revised_marks') is not None:
                concern.revised_marks = data['revised_marks']
            
            concern.save()
        
        return Response({
            'message': 'Concern reviewed successfully',
            'concern': ExamConcernSerializer(concern).data
        })



class StudentRaiseConcernView(generics.CreateAPIView):
    """Raise concern about exam result"""
    serializer_class = ExamConcernSerializer
    permission_classes = [IsAuthenticated,HasActiveSubscription]


     

class StudentConcernListView(generics.ListAPIView):
    """List student's concerns"""
    serializer_class = ExamConcernSerializer
    permission_classes = [IsAuthenticated, HasActiveSubscription]
    
    def get_queryset(self):
        return ExamConcern.objects.filter(
            student=self.request.user.student_profile
        ).select_related('result__exam', 'reviewed_by__user').order_by('-created_at')



