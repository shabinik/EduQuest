# exams/urls.py
from django.urls import path
from .views import (
    # Teacher URLs
    TeacherExamListCreateView,
    TeacherExamDetailView,
    TeacherExamResultsView,
    TeacherGradeResultView,
    TeacherConcernListView,
    TeacherReviewConcernView,
    # Student URLs
    StudentExamListView,
    StudentExamResultsView,
    StudentRaiseConcernView,
    StudentConcernListView,
)

urlpatterns = [
    # Teacher URLs
    path('teacher/exams/', TeacherExamListCreateView.as_view(), name='teacher-exam-list'),
    path('teacher/exams/<int:pk>/', TeacherExamDetailView.as_view(), name='teacher-exam-detail'),
    path('teacher/exams/<int:exam_id>/results/', TeacherExamResultsView.as_view(), name='teacher-exam-results'),
    path('teacher/results/<int:pk>/grade/', TeacherGradeResultView.as_view(), name='teacher-grade-result'),
    path('teacher/concerns/', TeacherConcernListView.as_view(), name='teacher-concern-list'),
    path('teacher/concerns/<int:concern_id>/review/', TeacherReviewConcernView.as_view(), name='teacher-review-concern'),
    
    # Student URLs
    path('student/exams/', StudentExamListView.as_view(), name='student-exam-list'),
    path('student/results/', StudentExamResultsView.as_view(), name='student-results'),
    path('student/concerns/raise/', StudentRaiseConcernView.as_view(), name='student-raise-concern'),
    path('student/concerns/', StudentConcernListView.as_view(), name='student-concern-list'),
]