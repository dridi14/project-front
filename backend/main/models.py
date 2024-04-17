from django.db import models
from django.contrib.auth.models import User


class PrivateMessage(models.Model):
    message = models.CharField(max_length=100)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
   
   
class Group(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='messanger_groups')
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_groups')

    def __str__(self):
        return self.name

class GroupMessage(models.Model):
    message = models.CharField(max_length=100)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_group_messages')
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='group_messages')
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
  