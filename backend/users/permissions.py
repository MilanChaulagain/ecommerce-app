from rest_framework.permissions import BasePermission

class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        return hasattr(user, 'userrole') and user.userrole.role in ['employee', 'superemployee', 'admin']

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        return hasattr(user, 'userrole') and user.userrole.role == 'admin'

class IsSuperEmployee(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        return hasattr(user, 'userrole') and user.userrole.role == 'superemployee'
