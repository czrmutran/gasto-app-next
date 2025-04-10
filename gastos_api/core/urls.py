from django.urls import path, include
from .views import register

urlpatterns = [
    path('api/register',register, name="register"),
]
