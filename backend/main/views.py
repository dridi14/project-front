from django.utils import timezone

from rest_framework import generics
from .models import PrivateMessage
from .serializers import PrivateMessageSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated
import requests
import json
from website import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
import jwt
from django.http import HttpResponse



class PrivateMessageListCreate(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = PrivateMessageSerializer
 
    def get_queryset(self):
        receiver_id = self.kwargs.get("receiver")
        return PrivateMessage.objects.filter(sender=self.request.user, receiver_id=receiver_id) | PrivateMessage.objects.filter(sender_id=receiver_id, receiver=self.request.user)

    def perform_create(self, serializer):
      receiver_id = self.kwargs.get("receiver")
      if receiver_id:
          receiver = User.objects.get(id=receiver_id)
          serializer.save(receiver=receiver)

          message_instance = serializer.instance

          jwt_token = jwt.encode(
              {
                  'mercure': {
                      'publish': ["*"]
                  }
              },
              settings.MERCURE_JWT,
              algorithm='HS256'
            )
          headers = {
                'Authorization': 'Bearer {}'.format(jwt_token),
                'Content-Type': 'application/x-www-form-urlencoded',
          }
          topic = f'test'
          data = {
              "id": message_instance.id,
              "message": message_instance.message,
              "sender": message_instance.sender.username,
              "receiver": message_instance.receiver.username,
              "time": message_instance.time.strftime("%Y-%m-%d %H:%M:%S"),
              'topic': topic,
          }

          try:
              response = requests.post(
                  settings.MERCURE_PUBLISH_URL,
                  data=data,
                  headers=headers,
              )
              response.raise_for_status()
          except requests.RequestException as e:
              print(f"Error broadcasting message: {e}")

          return Response({"status": "Message sent"})

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
          jwt_token = jwt.encode({'user_id': user.id}, settings.MERCURE_JWT, algorithm='HS256')
          access_token = str(refresh.access_token)
          return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "message": "Login successful",
                    "access": access_token,
                    "refresh": str(refresh),
                    "mercure_token": jwt_token,
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

class UserList(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = UserSerializer
    