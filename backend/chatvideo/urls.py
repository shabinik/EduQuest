from django.urls import path
from . views import StudentAIChatView,MeetingListCreateView,MeetingDetailView,StartMeetingView,EndMeetingView,JoinMeetingView

urlpatterns = [
    path("students/ai-chat/",StudentAIChatView.as_view()),

    path("meet/",MeetingListCreateView.as_view(), name="meeting-list-create"),
    path("meet/detail/<int:pk>/",MeetingDetailView.as_view(), name="meeting-detail"),
    path("meet/start/<int:pk>/",StartMeetingView.as_view(),name="meeting-start"),
    path("meet/end/<int:pk>/",EndMeetingView.as_view(),name="meeting-end"),
    path("meet/join/<int:pk>/",JoinMeetingView.as_view(),name="meeting-join"),
]