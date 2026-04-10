from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.

class NotificationListView(APIView):
    #fetch last 30 notificatuons
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(recipient=request.user)[:30]
        return Response(NotificationSerializer(notifs, many=True).data)
    

class MarkAllReadView(APIView):
    # mark all notification as read
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            recipient = request.user, is_read = False
        ).update(is_read = True)
        return Response({"success":True})


class MarkOneReadView(APIView):
    # mark one notification as read
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        Notification.objects.filter(
            pk=pk, recipient=request.user
        ).update(is_read=True)
        return Response({"success": True})