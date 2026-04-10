from django.urls import path
from .views import NotificationListView, MarkAllReadView, MarkOneReadView

urlpatterns = [
    path("",              NotificationListView.as_view(), name="notif-list"),
    path("mark-read/",    MarkAllReadView.as_view(),      name="notif-mark-all"),
    path("<int:pk>/read/", MarkOneReadView.as_view(),     name="notif-mark-one"),
]