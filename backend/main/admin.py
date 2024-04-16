from django.contrib import admin
from .models import PrivateMessage, GroupMessage, Group

admin.site.register(PrivateMessage)
admin.site.register(GroupMessage)
admin.site.register(Group)



