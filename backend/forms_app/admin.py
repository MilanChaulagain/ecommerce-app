from django.contrib import admin
from .models import FormSchema, FormSubmission


@admin.register(FormSchema)
class FormSchemaAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'created_by', 'created_at', 'submission_count']
    list_filter = ['created_at', 'created_by']
    search_fields = ['title', 'slug']
    readonly_fields = ['slug', 'created_at', 'updated_at']
    
    def submission_count(self, obj):
        return obj.submissions.count()
    submission_count.short_description = 'Submissions'


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ['form_schema', 'submitted_at', 'submitted_by', 'ip_address']
    list_filter = ['submitted_at', 'form_schema']
    search_fields = ['form_schema__title']
    readonly_fields = ['submitted_at']
