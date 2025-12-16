from rest_framework import serializers
from .models import ProfileField, ProfileValue


class ProfileFieldSerializer(serializers.ModelSerializer):
    """Serializer for ProfileField model"""
    
    choices_list = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfileField
        fields = [
            'id', 
            'label', 
            'field_type', 
            'required', 
            'order', 
            'placeholder', 
            'help_text',
            'choices',
            'choices_list',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'choices_list']
    
    def get_choices_list(self, obj):
        """Return choices as a list for frontend"""
        return obj.get_choices_list()
    
    def validate(self, data):
        """Validate field data"""
        if data.get('field_type') == 'select' and not data.get('choices'):
            raise serializers.ValidationError({
                'choices': 'Choices are required for dropdown fields.'
            })
        return data


class ProfileValueSerializer(serializers.ModelSerializer):
    """Serializer for ProfileValue model"""
    
    field_id = serializers.IntegerField(source='field.id', read_only=True)
    field_label = serializers.CharField(source='field.label', read_only=True)
    field_type = serializers.CharField(source='field.field_type', read_only=True)
    field_required = serializers.BooleanField(source='field.required', read_only=True)

    class Meta:
        model = ProfileValue
        fields = [
            'id',
            'field',
            'field_id',
            'field_label', 
            'field_type',
            'field_required',
            'value',
            'updated_at'
        ]
        read_only_fields = ['id', 'field_id', 'field_label', 'field_type', 'field_required', 'updated_at']


class ProfileValueCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating/updating profile values"""
    
    field = serializers.IntegerField()
    value = serializers.CharField(allow_blank=True)
    
    def validate_field(self, value):
        """Ensure field exists and belongs to the user"""
        request = self.context.get('request')
        if not ProfileField.objects.filter(id=value, user=request.user).exists():
            raise serializers.ValidationError(f"Field with id {value} not found or doesn't belong to you.")
        return value


class BulkProfileSaveSerializer(serializers.Serializer):
    """Serializer for bulk save endpoint"""
    
    data = ProfileValueCreateSerializer(many=True)