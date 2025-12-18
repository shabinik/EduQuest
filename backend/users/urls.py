from django.urls import path
from .views import CreateTeacherView,TeacherListView,TeacherProfileView,CreateStudentView,StudentProfileView,StudentListView,DeleteTeacherView,DeleteStudentView

urlpatterns = [
    path("teachers/create/", CreateTeacherView.as_view(), name="create-teacher"),
    path('teachers/',TeacherListView.as_view(),name='list-teachers'),
    path('teachers/profile/',TeacherProfileView.as_view(),name='profile-teachers'),
    path('teachers/delete/<int:teacher_id>/',DeleteTeacherView.as_view(),name='delete-teacher'),
    path('students/create/',CreateStudentView.as_view(),name='create-student'),
    path("students/list/", StudentListView.as_view(), name="list-students"),
    path("students/profile/", StudentProfileView.as_view(), name="student-profile"),
    path('students/delete/<int:student_id>/',DeleteStudentView.as_view(),name='delete-student')
] 
