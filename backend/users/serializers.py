from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserRole
from django.conf import settings



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
