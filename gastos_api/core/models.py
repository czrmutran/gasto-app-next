from django.db import models
from django.contrib.auth.models import User

class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    renda_mensal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f'Perfil de {self.usuario.username}'


class Gasto(models.Model):
    TIPO_CHOICES = [
        ('fixo', 'Fixo'),
        ('variável', 'Variável'),
    ]

    CATEGORIAS = [
        ('Investimentos', 'Investimentos'),
        ('Alimentação', 'Alimentação'),
        ('Transporte', 'Transporte'),
        ('Presentes', 'Presentes'),
        ('Cuidados Pessoais', 'Cuidados Pessoais'),
        ('Lazer', 'Lazer'),
        ('Custos Fixos', 'Custos Fixos'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos')
    item = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.CharField(max_length=30, choices=CATEGORIAS)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='variável')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.item} - R${self.valor:.2f}'
