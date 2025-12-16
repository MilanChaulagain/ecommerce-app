from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import ProfileField, ProfileValue
from .serializers import (
    ProfileFieldSerializer, 
    ProfileValueSerializer,
    BulkProfileSaveSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_home(request):
    """
    GET /api/user/home/
    
    Return dashboard data for the user
    
    Response:
    {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "role": "customer"
        },
        "stats": {
            "fields_count": 5,
            "values_count": 3,
            "has_profile_fields": true,
            "has_profile_data": true,
            "completion_percentage": 60
        }
    }
    """
    user = request.user
    fields_count = ProfileField.objects.filter(user=user).count()
    values_count = ProfileValue.objects.filter(user=user).count()
    
    # Calculate completion percentage
    completion = 0
    if fields_count > 0:
        completion = int((values_count / fields_count) * 100)
    
    return Response({
        "user": {
            "id": user.id,
            "email": user.email,
            "username": getattr(user, 'username', ''),
            "role": getattr(user, 'role', 'user')
        },
        "stats": {
            "fields_count": fields_count,
            "values_count": values_count,
            "has_profile_fields": fields_count > 0,
            "has_profile_data": values_count > 0,
            "completion_percentage": completion
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def profile_fields(request):
    """
    GET /api/user/profile-fields/
    List all profile fields for the current user
    
    POST /api/user/profile-fields/
    Create a new profile field
    
    POST Body:
    {
        "label": "Phone Number",
        "field_type": "text",
        "required": true,
        "order": 1,
        "placeholder": "Enter your phone",
        "help_text": "10 digit number"
    }
    """
    if request.method == 'GET':
        fields = ProfileField.objects.filter(user=request.user)
        serializer = ProfileFieldSerializer(fields, many=True)
        return Response({
            "count": fields.count(),
            "results": serializer.data
        })
    
    elif request.method == 'POST':
        serializer = ProfileFieldSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {
                    "message": "Field created successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "message": "Validation failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def profile_field_detail(request, field_id):
    """
    GET /api/user/profile-fields/{id}/
    Retrieve a specific field
    
    PUT /api/user/profile-fields/{id}/
    Update a field
    
    DELETE /api/user/profile-fields/{id}/
    Delete a field
    """
    try:
        field = ProfileField.objects.get(id=field_id, user=request.user)
    except ProfileField.DoesNotExist:
        return Response(
            {"error": "Field not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ProfileFieldSerializer(field)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProfileFieldSerializer(field, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Field updated successfully",
                "data": serializer.data
            })
        return Response(
            {
                "message": "Validation failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    elif request.method == 'DELETE':
        # Also delete associated values
        ProfileValue.objects.filter(field=field).delete()
        field.delete()
        return Response(
            {"message": "Field deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_form(request):
    """
    GET /api/user/profile-form/
    
    Get the complete form structure with existing values
    
    Response:
    {
        "fields": [
            {
                "id": 1,
                "label": "Full Name",
                "field_type": "text",
                "required": true,
                "order": 1,
                "existing_value": "John Doe"
            }
        ]
    }
    """
    fields = ProfileField.objects.filter(user=request.user).order_by('order')
    
    # Get existing values
    existing_values = {}
    for value in ProfileValue.objects.filter(user=request.user):
        existing_values[value.field_id] = value.value
    
    # Build response
    form_data = []
    for field in fields:
        field_data = ProfileFieldSerializer(field).data
        field_data['existing_value'] = existing_values.get(field.id, '')
        form_data.append(field_data)
    
    return Response({
        "count": len(form_data),
        "fields": form_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_profile(request):
    """
    POST /api/user/profile/save/
    
    Save profile data (bulk create/update)
    
    Body:
    {
        "data": [
            {"field": 1, "value": "John Doe"},
            {"field": 2, "value": "john@example.com"},
            {"field": 3, "value": "1234567890"}
        ]
    }
    
    Response:
    {
        "message": "Profile saved successfully",
        "saved_count": 3,
        "data": [...]
    }
    """
    serializer = BulkProfileSaveSerializer(data=request.data, context={'request': request})
    
    if not serializer.is_valid():
        return Response(
            {
                "message": "Validation failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    items = serializer.validated_data['data']
    saved = []
    errors = []
    
    with transaction.atomic():
        for item in items:
            field_id = item['field']
            value = item['value']
            
            try:
                field = ProfileField.objects.get(id=field_id, user=request.user)
                
                # Validate required fields
                if field.required and not value:
                    errors.append(f"{field.label} is required")
                    continue
                
                # Save or update
                profile_value, created = ProfileValue.objects.update_or_create(
                    user=request.user,
                    field=field,
                    defaults={"value": value}
                )
                
                saved.append(ProfileValueSerializer(profile_value).data)
                
            except ProfileField.DoesNotExist:
                errors.append(f"Field with id {field_id} not found")
    
    if errors:
        return Response(
            {
                "message": "Some fields failed validation",
                "saved_count": len(saved),
                "errors": errors,
                "data": saved
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({
        "message": "Profile saved successfully",
        "saved_count": len(saved),
        "data": saved
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_profile(request):
    """
    GET /api/user/profile/view/
    
    View all profile data for the current user
    
    Response:
    {
        "count": 3,
        "data": [
            {
                "id": 1,
                "field": 1,
                "field_label": "Full Name",
                "field_type": "text",
                "value": "John Doe",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        ]
    }
    """
    values = ProfileValue.objects.filter(user=request.user).select_related('field').order_by('field__order')
    
    if not values.exists():
        return Response(
            {
                "message": "No profile data found",
                "count": 0,
                "data": []
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ProfileValueSerializer(values, many=True)
    return Response({
        "count": values.count(),
        "data": serializer.data
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_value(request, value_id):
    """
    DELETE /api/user/profile/value/{id}/
    
    Delete a specific profile value
    """
    try:
        value = ProfileValue.objects.get(id=value_id, user=request.user)
        value.delete()
        return Response(
            {"message": "Profile value deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    except ProfileValue.DoesNotExist:
        return Response(
            {"error": "Profile value not found"},
            status=status.HTTP_404_NOT_FOUND
        )