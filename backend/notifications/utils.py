import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from . models import Notification


def send_notification(recipients, notif_type, title, message, link = ""):
    """
    Call this from anywhere to send a real-time notification.
    link       : frontend route to open on click e.g. "/student/assignment"
    """
    channel_layer = get_channel_layer()

    for user in recipients:
        # Save to DB so user sees it even if they were offline
        notif = Notification.objects.create(
            recipient = user,
            notif_type = notif_type,
            title = title,
            message = message,
            link = link,
        )

        # Push instantly over WebSocket if user is online
        async_to_sync(channel_layer.group_send)(
            f"notif_user_{user.id}",
            {
                "type":       "notify",
                "id":         notif.id,
                "notif_type": notif_type,
                "title":      title,
                "message":    message,
                "link":       link,
                "created_at": notif.created_at.isoformat(),
            }
        )



