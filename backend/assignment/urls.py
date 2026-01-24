from django.urls import path
from . views import (
    TeacherAssignmentListCreateView,TeacherAssignmentDetailView,
    StudentAssignmentListView,StudentAssignmentSubmissionCreateView,
    TeacherSubmissionListView, TeacherSubmissionGradeView
)

urlpatterns = [
    path("teacher/assignments/", TeacherAssignmentListCreateView.as_view()),
    path("teacher/assignments/<int:pk>/", TeacherAssignmentDetailView.as_view()),
    path("teacher/submissions/", TeacherSubmissionListView.as_view()),
    path("teacher/submissions/<int:pk>/grade/", TeacherSubmissionGradeView.as_view()),
    path("student/assignments/", StudentAssignmentListView.as_view()),
    path("student/submit/", StudentAssignmentSubmissionCreateView.as_view()),
]

