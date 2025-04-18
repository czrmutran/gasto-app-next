from django.urls import path
from core.views import RegisterView, LoginView, GastoView, GastoDetailView, GastoDeOutroUsuarioView, RendaMensalView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/register/', RegisterView.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/renda/', RendaMensalView.as_view(), name='renda-mensal'),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/gastos/', GastoView.as_view()),
    path('api/gastos/<int:pk>/', GastoDetailView.as_view()),
    path('api/gastos/de/<str:username>/', GastoDeOutroUsuarioView.as_view()),

]
