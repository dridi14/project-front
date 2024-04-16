from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PrivateMessage, GroupMessage, Group


class PrivateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateMessage
        fields = ("id", "message", "sender", "time")
        read_only_fields = ("sender", "receiver")
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


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



class GroupMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMessage
        fields = ("id", "message", "sender", "group", "time")
    def create(self, validated_data):
        return super().create(validated_data)
    
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name", "members", "admin")
    def create(self, validated_data):
        return super().create(validated_data)