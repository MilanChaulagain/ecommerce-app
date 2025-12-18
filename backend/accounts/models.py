from django.contrib.auth.models import Group
from django.db import models

class Role(Group):
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"
