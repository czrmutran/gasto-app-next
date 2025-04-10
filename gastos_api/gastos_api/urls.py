from django.urls import path
from core.views import RegisterView, LoginView, GastoView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/register/', RegisterView.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/gastos/', GastoView.as_view()),
]
