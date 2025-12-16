from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class ProfileField(models.Model):
    """Custom fields created by the user"""
    
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('email', 'Email'),
        ('date', 'Date'),
        ('textarea', 'TextArea'),
        ('select', 'Dropdown'),
        ('checkbox', 'Checkbox'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_fields')
    label = models.CharField(max_length=100, help_text="Display label for the field")
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    placeholder = models.CharField(max_length=200, blank=True, null=True)
    help_text = models.TextField(blank=True, null=True)
    choices = models.TextField(blank=True, null=True, help_text="For dropdown: Option1,Option2,Option3")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['user', 'label']
        indexes = [
            models.Index(fields=['user', 'order']),
        ]

    def __str__(self):
        return f"{self.label} ({self.user.email})"
    
    def clean(self):
        if self.field_type == 'select' and not self.choices:
            raise ValidationError({'choices': 'Choices are required for dropdown fields.'})
    
    def get_choices_list(self):
        """Return choices as a list"""
        if self.choices:
            return [choice.strip() for choice in self.choices.split(',')]
        return []


class ProfileValue(models.Model):
    """Stores user-submitted values for custom fields"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_values')
    field = models.ForeignKey(ProfileField, on_delete=models.CASCADE, related_name='values')
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'field')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['field']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.field.label}: {self.value[:50]}"

