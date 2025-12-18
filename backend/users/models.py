from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
import os



class UserRole(models.Model):
    ROLE_CHOICES = (
        ('user','User'),
        ('employee','Employee'),
        ('superemployee','SuperEmployee'),
        ('admin','Admin'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class UserProfile(models.Model):
    """Extended profile for storing avatar and other user metadata."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


class PagePermission(models.Model):
    """Define page access rules by path, role list and per-user overrides."""
    name = models.CharField(max_length=150)
    path = models.CharField(max_length=300, help_text='URL path to match (prefix or exact)')
    prefix = models.BooleanField(default=True, help_text='If true, match path prefix')
    # store allowed roles as comma separated values (e.g. 'admin,superemployee')
    allowed_roles = models.CharField(max_length=200, blank=True, default='')
    allowed_users = models.ManyToManyField(User, blank=True, related_name='page_permissions')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def allowed_roles_list(self):
        if not self.allowed_roles:
            return []
        return [r.strip() for r in self.allowed_roles.split(',') if r.strip()]

    def __str__(self):
        return f"{self.name} -> {self.path} ({'prefix' if self.prefix else 'exact'})"
