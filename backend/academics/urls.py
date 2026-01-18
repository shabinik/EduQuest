from django.urls import path
from . views import CreateAnnouncement,AdminAnnouncementUpdateDeleteView,AnnouncementAudienceView,AdminAnnouncementList

urlpatterns = [
    path('create/announcement/',CreateAnnouncement.as_view()),
    path('announcement/audience/',AnnouncementAudienceView.as_view()),
    path('admin/announcement/list/',AdminAnnouncementList.as_view()),
    path('announcement/admin/detail/<int:pk>/',AdminAnnouncementUpdateDeleteView.as_view()),
]
