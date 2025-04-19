from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer, GastoSerializer, PerfilUsuarioSerializer
from .models import Gasto, PerfilUsuario

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Usuário registrado com sucesso!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class RendaMensalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfil = request.user.perfil
        serializer = PerfilUsuarioSerializer(perfil)
        return Response(serializer.data)

    def put(self, request):
        perfil = request.user.perfil
        serializer = PerfilUsuarioSerializer(perfil, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GastoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gastos = Gasto.objects.filter(usuario=request.user).order_by('-criado_em')
        serializer = GastoSerializer(gastos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GastoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GastoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Gasto, pk=pk, usuario=user)

    def put(self, request, pk):
        gasto = self.get_object(pk, request.user)
        serializer = GastoSerializer(gasto, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        gasto = self.get_object(pk, request.user)
        serializer = GastoSerializer(gasto, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        gasto = self.get_object(pk, request.user)
        gasto.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class GastoDeOutroUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            usuario = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        gastos = Gasto.objects.filter(usuario=usuario).order_by('-criado_em')
        serializer = GastoSerializer(gastos, many=True)
        return Response(serializer.data)

