from django.contrib import admin
from django.contrib.auth.models import User
from .models import UserRole 
from .models import PagePermission

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(PagePermission)
class PagePermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'path', 'prefix', 'active')
    list_filter = ('prefix', 'active')
    search_fields = ('name', 'path')
