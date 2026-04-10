from django.urls import path
from . views import (CreateAnnouncement,AdminAnnouncementUpdateDeleteView,AnnouncementAudienceView,AdminAnnouncementList,
                    TeacherAttendanceListView,TeacherMarkAttendanceView,TeacherGetClassStudentsView,TeacherAttendanceDetailView,
                    StudentAttendanceView,StudentMonthlyReportView,
                    StudentLeaveRequestListCreateView,StudentLeaveRequestCancelView,TeacherLeaveRequestListView,TeacherLeaveReviewView )

urlpatterns = [
    path('create/announcement/',CreateAnnouncement.as_view()),
    path('announcement/audience/',AnnouncementAudienceView.as_view()),
    path('admin/announcement/list/',AdminAnnouncementList.as_view()),
    path('announcement/admin/detail/<int:pk>/',AdminAnnouncementUpdateDeleteView.as_view()),
    #Attendance
    path('teacher/attendance/', TeacherAttendanceListView.as_view(), name='teacher-attendance-list'),
    path('teacher/attendance/mark/', TeacherMarkAttendanceView.as_view(), name='teacher-mark-attendance'),
    path('teacher/attendance/students/', TeacherGetClassStudentsView.as_view(), name='teacher-class-students'),
    path('teacher/attendance/<int:pk>/', TeacherAttendanceDetailView.as_view(), name='teacher-attendance-detail'),
    
    path('student/attendance/', StudentAttendanceView.as_view(), name='student-attendance'),
    path('student/attendance/monthly/', StudentMonthlyReportView.as_view(), name='student-monthly-report'),

    path("student/leave/", StudentLeaveRequestListCreateView.as_view()),
    path("student/leave/<int:pk>/", StudentLeaveRequestCancelView.as_view()),
    path("teacher/leave/", TeacherLeaveRequestListView.as_view()),
    path("teacher/leave/<int:pk>/review/", TeacherLeaveReviewView.as_view()),
]
