from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . views import (
    CreateClassView,ClassListView,UpdateClassView,DeleteClassView,
    ClassDropdownView,ClassDetailView,TeacherClassView,
    SubjectViewSet,TimeSlotViewSet,TimeTableViewSet,TimeTableEntryViewSet
)


router = DefaultRouter()
router.register(r'subjects',SubjectViewSet, basename='subjects')
router.register(r'timeslots',TimeSlotViewSet, basename='timeslots')
router.register(r'timetables', TimeTableViewSet, basename='timetables')
router.register(r'timetable-entries', TimeTableEntryViewSet, basename='timetable-entries')


urlpatterns = [
    path('', include(router.urls)),
    path("create/class/",CreateClassView.as_view(),name='create-class'),
    path("classes/",ClassListView.as_view(),name='list-classs'),
    path('update/class/<int:class_id>/',UpdateClassView.as_view()),
    path('delete/class/<int:class_id>/',DeleteClassView.as_view()),
    path("classes/dropdown/", ClassDropdownView.as_view()),
    path("class/details/<int:class_id>/",ClassDetailView.as_view()),
    path('teacher/class/',TeacherClassView.as_view()),
]