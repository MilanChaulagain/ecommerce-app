from django.contrib.auth.models import User, Permission
from rest_framework import serializers
from .models import Role

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class RoleSerializer(serializers.ModelSerializer):
    # Read permissions as nested objects, write as list of pks via `permission_ids`
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Permission.objects.all(), source='permissions', required=False
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids']

    def create(self, validated_data):
        perms = validated_data.pop('permissions', [])
        role = super().create(validated_data)
        if perms:
            role.permissions.set(perms)
        return role

    def update(self, instance, validated_data):
        perms = validated_data.pop('permissions', None)
        role = super().update(instance, validated_data)
        if perms is not None:
            role.permissions.set(perms)
        return role

class UserSerializer(serializers.ModelSerializer):
    groups = RoleSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'groups']
