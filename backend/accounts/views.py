from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Role
from .serializers import UserSerializer, RoleSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['post'])
    def assign_roles(self, request, pk=None):
        user = self.get_object()
        roles_ids = request.data.get('roles', [])
        roles = Role.objects.filter(id__in=roles_ids)
        user.groups.set(roles)
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
