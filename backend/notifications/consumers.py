import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            return
        
        # Every user gets their own private group
        self.group_name = f"notif_user_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    
    async def disconnect(self, close_code):
        if hasattr(self,"group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
    

    async def notify(self, event):
        await self.send(text_data=json.dumps({
             "id":         event["id"],
            "notif_type": event["notif_type"],
            "title":      event["title"],
            "message":    event["message"],
            "link":       event["link"],
            "created_at": event["created_at"],
        }))
     