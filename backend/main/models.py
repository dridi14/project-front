from django.db import models


class Room(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Message(models.Model):
    message = models.CharField(max_length=100)
    user = models.CharField(max_length=100)
    Room = models.CharField(max_length=100)
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
