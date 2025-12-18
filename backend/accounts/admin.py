from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin
from .models import Role


admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    filter_horizontal = ('groups', 'user_permissions',)

@admin.register(Role)
class RoleAdmin(GroupAdmin):
    fieldsets = (
        (None, {'fields': ('name', 'permissions', 'description')}),
    )
    filter_horizontal = ('permissions',)
