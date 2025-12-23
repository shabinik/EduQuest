from django.urls import path
from .views import (
     CreateTeacherView,TeacherListView,TeacherProfileView,
     CreateStudentView,StudentProfileView,StudentListView,
     DeleteTeacherView,DeleteStudentView,
     UpdateTeacherView,UpdateStudentView,AdminStudentDetailView,
)

urlpatterns = [
    path("teachers/create/", CreateTeacherView.as_view(), name="create-teacher"),
    path('teachers/',TeacherListView.as_view(),name='list-teachers'),
    path('teachers/profile/',TeacherProfileView.as_view(),name='profile-teachers'),
    path('teachers/update/<int:teacher_id>/',UpdateTeacherView.as_view(),name="update-teacher"),
    path('teachers/delete/<int:teacher_id>/',DeleteTeacherView.as_view(),name='delete-teacher'),
    path('students/create/',CreateStudentView.as_view(),name='create-student'),
    path("students/list/", StudentListView.as_view(), name="list-students"),
    path("students/profile/", StudentProfileView.as_view(), name="student-profile"),
    path('students/delete/<int:student_id>/',DeleteStudentView.as_view(),name='delete-student'),
    path("students/update/<int:student_id>/",UpdateStudentView.as_view(),name='update-student'),
    path("students/<int:student_id>/",AdminStudentDetailView.as_view(),name="admin-student-detail"),

] 
