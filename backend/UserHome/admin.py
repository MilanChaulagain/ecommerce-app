from django.contrib import admin

# Register your models here.
from .models import ProfileField, ProfileValue


@admin.register(ProfileField)
class ProfileFieldAdmin(admin.ModelAdmin):
    list_display = ['label', 'user', 'field_type', 'required', 'order', 'created_at']
    list_filter = ['field_type', 'required', 'created_at']
    search_fields = ['label', 'user__email', 'user__username']
    ordering = ['user', 'order']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'label', 'field_type', 'required', 'order')
        }),
        ('Additional Options', {
            'fields': ('placeholder', 'help_text', 'choices'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProfileValue)
class ProfileValueAdmin(admin.ModelAdmin):
    list_display = ['user', 'field', 'value_preview', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__username', 'field__label', 'value']
    readonly_fields = ['created_at', 'updated_at']
    
    def value_preview(self, obj):
        return obj.value[:100] + '...' if len(obj.value) > 100 else obj.value
    value_preview.short_description = 'Value Preview'