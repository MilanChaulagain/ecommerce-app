from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string


def generate_unique_slug():
    """Generate a unique 8-character slug for form URLs"""
    return get_random_string(8)


class FormSchema(models.Model):
    """
    Stores the structure/blueprint of a user-created form.
    """
    title = models.CharField(max_length=255, help_text="Name of the form")
    slug = models.SlugField(
        unique=True, 
        max_length=8,
        default=generate_unique_slug,
        help_text="Unique URL identifier for accessing the form"
    )
    description = models.TextField(blank=True, null=True)
    
    language_config = models.JSONField(
        default=dict,
        help_text="Primary and optional language codes"
    )
    
    fields_structure = models.JSONField(
        default=list,
        help_text="Array of field definitions"
    )
    
    relationships = models.JSONField(
        default=list,
        help_text="Defines relationships to other forms"
    )
    
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='forms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} ({self.slug})"


class FormSubmission(models.Model):
    """
    Stores actual user submissions to a form.
    Data is stored as JSON to accommodate dynamic schemas.
    """
    form_schema = models.ForeignKey(
        FormSchema,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    
    data = models.JSONField(
        help_text="User-submitted data matching the form schema"
    )
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submissions'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['-submitted_at']),
            models.Index(fields=['form_schema', '-submitted_at']),
        ]
        
    def __str__(self):
        return f"Submission to {self.form_schema.title} at {self.submitted_at}"


class FormFile(models.Model):
    """
    Stores uploaded files (images, videos, etc.) for a submission.
    """
    submission = models.ForeignKey(
        FormSubmission, 
        on_delete=models.CASCADE, 
        related_name='files'
    )
    file = models.FileField(upload_to='form_submissions/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File {self.file.name} for submission {self.submission.id}"
