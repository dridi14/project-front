from django.utils import timezone

from rest_framework import generics
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated
import requests
import json
from website import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User


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
        user = self.request.user
        message_instance = serializer.save(user=user, room=room)

        topic = f'room-{self.kwargs["room"]}'
        data = {
            "id": message_instance.id,
            "message": message_instance.message,
            "user": message_instance.user.username,
            "room": message_instance.room.id,
            "time": message_instance.time.strftime("%Y-%m-%d %H:%M:%S"),
        }

        # Broadcast the message manually using requests library
        try:
            response = requests.post(
                settings.MERCURE_PUBLISH_URL,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                data={
                    'topic': topic,
                    'data': json.dumps(data),
                },
            )
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Error broadcasting message: {e}")

class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class CustomLoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user:
          refresh = RefreshToken.for_user(user)
          access_token = str(refresh.access_token)
          return Response(
              {
                  "id": user.id,
                  "username": user.username,
                  "message": "Login successful",
                  "access": access_token,
                  "refresh": str(refresh),
              },
              status=status.HTTP_200_OK,
          )
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

        