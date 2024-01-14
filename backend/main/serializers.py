from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, Message


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("id", "name", "description")


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("id", "message", "time")
    
    def create(self, validated_data):
        user = validated_data.pop('user', None)
        room = validated_data.pop('room', None)

        instance = Message(**validated_data)
        instance.user = user
        instance.room = room
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data["password"]
        user = User.objects.create_user(
            username=username, password=password,
        )
        return user
