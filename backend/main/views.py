from django.utils import timezone

from rest_framework import generics
from .models import PrivateMessage
from .serializers import PrivateMessageSerializer, UserSerializer, GroupMessageSerializer, GroupSerializer
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
from django.contrib.auth.models import User, Group
import jwt
from django.http import HttpResponse
from django.http import JsonResponse
from website import settings
from urllib.parse import urlencode
from datetime import datetime, timedelta

def generate_jwt_for_publishing(topics=None, receives=None):
    payload = {
        'mercure': {
            'publish': [topic for topic in topics] if topics else ['*'],
            'subscribe': [f"user/{user_id}" for user_id in receives] if receives else ['*'],
        },
        'exp': datetime.utcnow() + timedelta(minutes=60) 
    }
    return jwt.encode(payload, settings.MERCURE_JWT_SECRET, algorithm='HS256')

def publish_to_mercure(topic, data):
    jwt_token = generate_jwt_for_publishing([topic])
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    post_data = {
        "topic": topic,
        "data": json.dumps(data),
    }
    response = requests.post(settings.MERCURE_PUBLISH_URL, data=post_data, headers=headers)
    return response
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

            jwt_token = generate_jwt_for_publishing([f"user/{receiver_id}"])
            data = {
                "topic": f"user/{receiver_id}",
                "data": json.dumps({
                    "id": message_instance.id,
                    "message": message_instance.message,
                    "sender": message_instance.sender.username,
                    "receiver": message_instance.receiver.username,
                    "time": message_instance.time.strftime("%Y-%m-%d %H:%M:%S"),
                }),
            }
            headers = {
                'Authorization': f'Bearer {jwt_token}',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
            response = requests.post(settings.MERCURE_PUBLISH_URL, data=data, headers=headers)
            if response.status_code != 200:
                print("Failed to publish message:", response.text)
                return JsonResponse({'error': response.text}, status=500)
            return JsonResponse({"status": "Message sent"})

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
          payload = {
              'mercure': {
                  'publish': ['*'],
              },
              'exp': datetime.utcnow() + timedelta(minutes=60) 
          }
          publish_to_mercure(f"user/{user.id}", {"message": "User logged in"})
          jwt_token = jwt.encode(payload, settings.MERCURE_JWT_SECRET, algorithm='HS256')
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

class PingUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        jwt_token = generate_jwt_for_publishing([f"user/{user_id}"])
        data = {
            'topic': f"user/{user_id}",
            "data": json.dumps({
                "message": "Ping",
                "sender": request.user.username,
                "time": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
            }),
            "content": "Hello, world!",
        }
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        response = requests.post(settings.MERCURE_PUBLISH_URL, data=data, headers=headers)
        if response.status_code != 200:
            print("Failed to publish message:", response.text)
            return JsonResponse({'error': response.text}, status=500)
        return JsonResponse({"status": "Message sent"})


class GroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.data['admin'] = request.user.id
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save()
            return Response(
                {"message": "Group created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        groups = request.user.groups.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)
    
    def delete(self, request, group_id):
        group = Group.objects.get(id=group_id)
        group.delete()
        return Response({"message": "Group deleted"})
    
    def put(self, request, group_id):
        group = Group.objects.get(id=group_id)
        serializer = GroupSerializer(group, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Group updated successfully"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class GroupMessageListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)
        messages = group.groupmessage_set.all()
        for message in messages:
            message.sender = message.sender.username
            message.group = message.group.name
            message.time = message.time.strftime("%Y-%m-%d %H:%M:%S")
        serializer = GroupMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)
        serializer = GroupMessageSerializer(data=request.data)
        if serializer.is_valid():
            group_message = serializer.save(sender=request.user, group=group)
            data = {
                "message": group_message.message,
                "sender": group_message.sender.username,
                "group": group_message.group.name,
                "time": group_message.time.strftime("%Y-%m-%d %H:%M:%S"),
            }
            response = publish_to_mercure(f"group/{group_id}", data)
            if response.status_code != 200:
                print("Failed to publish message:", response.text)
                return JsonResponse({'error': response.text}, status=500)
            return Response(
                {"message": "Group message sent"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)