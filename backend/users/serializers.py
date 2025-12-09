from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserRole

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='userrole.role', default='user')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
