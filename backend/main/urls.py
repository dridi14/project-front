from django.urls import path, include
from django.contrib import admin
from . import views
from .views import RoomListCreate, MessageListCreate, CreateUserView, CustomLoginView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("accounts/register/", CreateUserView.as_view(), name="register"),
    path("accounts/login/", CustomLoginView.as_view(), name="login"),
    path("accounts/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("rooms/", RoomListCreate.as_view(), name="room_list"),
    path(
        "rooms/<int:room>/messages/", MessageListCreate.as_view(), name="message_list"
    ),
    path("accounts/users/", views.UserList.as_view(), name="user_list"),

]
