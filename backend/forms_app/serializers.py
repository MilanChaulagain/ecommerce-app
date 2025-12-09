from rest_framework import serializers
from .models import FormSchema, FormSubmission


class FormSchemaSerializer(serializers.ModelSerializer):
    """Serializer for creating and retrieving form schemas"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FormSchema
        fields = [
            'id', 'title', 'slug', 'description', 'language_config',
            'fields_structure', 'relationships', 'created_by', 
            'created_by_username', 'created_at', 'updated_at', 'submission_count'
        ]
        read_only_fields = ['slug', 'created_by', 'created_at', 'updated_at']
    
    def get_submission_count(self, obj):
        return obj.submissions.count()
    
    def validate_language_config(self, value):
        """Ensure language config has the required structure"""
        if 'primary' not in value:
            raise serializers.ValidationError("language_config must have a 'primary' key")
        return value
    
    def validate_fields_structure(self, value):
        """Validate that all fields have labels in the primary language"""
        if not isinstance(value, list):
            raise serializers.ValidationError("fields_structure must be an array")
        
        for field in value:
            if 'id' not in field or 'type' not in field:
                raise serializers.ValidationError("Each field must have 'id' and 'type'")
            if 'labels' not in field or not isinstance(field['labels'], dict):
                raise serializers.ValidationError("Each field must have a 'labels' dictionary")
        
        return value


class FormSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for submitting and retrieving form data"""
    form_title = serializers.CharField(source='form_schema.title', read_only=True)
    form_slug = serializers.CharField(source='form_schema.slug', read_only=True)
    
    class Meta:
        model = FormSubmission
        fields = [
            'id', 'form_schema', 'form_title', 'form_slug',
            'data', 'submitted_at', 'submitted_by', 'ip_address'
        ]
        read_only_fields = ['submitted_at']
    
    def validate(self, attrs):
        """Validate submission data against the form schema"""
        form_schema = attrs.get('form_schema')
        data = attrs.get('data')
        
        if not form_schema:
            raise serializers.ValidationError("form_schema is required")
        
        # Validate required fields
        for field in form_schema.fields_structure:
            field_id = field.get('id')
            if field.get('required', False) and field_id not in data:
                raise serializers.ValidationError(
                    f"Required field '{field_id}' is missing"
                )
        
        return attrs


class FormSubmissionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing submissions in dashboard"""
    class Meta:
        model = FormSubmission
        fields = ['id', 'data', 'submitted_at', 'submitted_by']
