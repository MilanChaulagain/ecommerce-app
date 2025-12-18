from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserRole
from django.conf import settings
from .models import PagePermission
from django.contrib.auth.models import User
from rest_framework import serializers



class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='userrole.role', default='user')
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'avatar']

    def get_avatar(self, obj):
        try:
            prof = obj.userprofile
            if prof.avatar and hasattr(prof.avatar, 'url'):
                request = self.context.get('request')
                if request is not None:
                    return request.build_absolute_uri(prof.avatar.url)
                return prof.avatar.url
        except Exception:
            return None
        return None


class PagePermissionSerializer(serializers.ModelSerializer):
    allowed_roles = serializers.ListField(child=serializers.CharField(), required=False)
    allowed_users = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)

    class Meta:
        model = PagePermission
        fields = ['id', 'name', 'path', 'prefix', 'allowed_roles', 'allowed_users', 'active', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['allowed_roles'] = instance.allowed_roles_list()
        data['allowed_users'] = [u.id for u in instance.allowed_users.all()]
        return data

    def create(self, validated_data):
        roles = validated_data.pop('allowed_roles', [])
        users = validated_data.pop('allowed_users', [])
        validated_data['allowed_roles'] = ','.join(roles)
        perm = PagePermission.objects.create(**validated_data)
        if users:
            perm.allowed_users.set(users)
        return perm

    def update(self, instance, validated_data):
        roles = validated_data.pop('allowed_roles', None)
        users = validated_data.pop('allowed_users', None)
        if roles is not None:
            instance.allowed_roles = ','.join(roles)
        if users is not None:
            instance.allowed_users.set(users)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance
