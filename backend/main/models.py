from django.db import models
from django.contrib.auth.models import User


class PrivateMessage(models.Model):
    message = models.CharField(max_length=100)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message