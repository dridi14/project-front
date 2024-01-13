from django.utils import timezone

from rest_framework import generics
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated
import requests
import json
from website import settings
from django_mercure.publisher import publish

class RoomListCreate(generics.ListCreateAPIView):
    permission_classes = IsAuthenticated
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class MessageListCreate(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MessageSerializer

    def get_queryset(self):
        room = self.kwargs["room"]
        return Message.objects.filter(Room=room)

    def perform_create(self, serializer):
    room = Room.objects.get(id=self.kwargs["room"])

    message_instance = serializer.save(user=self.request.user, Room=room)

    topic = f'room-{self.kwargs["room"]}'
    data = {
        "id": message_instance.id,
        "message": message_instance.message,
        "user": message_instance.user,
        "room": message_instance.Room,
        "time": message_instance.time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    # Broadcast the message
    publish(topic, data)

class CreateUserView(generics.CreateAPIView):
    permission_classes = ()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        return super().perform_create(serializer)
