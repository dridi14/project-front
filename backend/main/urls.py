from django.urls import path, include
from django.contrib import admin
from . import views
from .views import PrivateMessageListCreate, CreateUserView, CustomLoginView, PingUserView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("accounts/register/", CreateUserView.as_view(), name="register"),
    path("accounts/login/", CustomLoginView.as_view(), name="login"),
    path("accounts/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('private-messages/<int:receiver>/', PrivateMessageListCreate.as_view(), name='private-message-list-create'),
    path("accounts/users/", views.UserList.as_view(), name="user_list"),
    path('ping-user/<int:user_id>/', PingUserView.as_view(), name='ping-user'),

]
