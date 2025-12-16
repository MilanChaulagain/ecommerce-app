from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import FormSchema, FormSubmission
from .serializers import (
    FormSchemaSerializer, 
    FormSubmissionSerializer,
    FormSubmissionListSerializer
)
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsSuperEmployee


class FormSchemaViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing form schemas.
    
    - list: Get all forms created by the user
    - create: Create a new form schema
    - retrieve: Get a specific form by slug
    - update: Update form structure
    - destroy: Delete a form (disabled)
    """
    queryset = FormSchema.objects.all()
    serializer_class = FormSchemaSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        """Apply different permissions for different actions"""
        if self.action == 'create':
            permission_classes = [IsAuthenticated, IsSuperEmployee]
        elif self.action in ['destroy']:
            permission_classes = [IsAuthenticated]  # deny deletion
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsSuperEmployee]
        else:
            permission_classes = [IsAuthenticated]
        return [perm() for perm in permission_classes]

    def get_queryset(self):
        """Filter forms by the authenticated user"""
        if self.request.user.is_authenticated:
            return FormSchema.objects.filter(created_by=self.request.user)
        return FormSchema.objects.all()

    def perform_create(self, serializer):
        """Automatically assign the current user as the creator"""
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            default_user, _ = User.objects.get_or_create(
                username='anonymous',
                defaults={'email': 'anonymous@example.com'}
            )
            serializer.save(created_by=default_user)

    def destroy(self, request, *args, **kwargs):
        """Disable deletion"""
        return Response(
            {"error": "Deleting forms is not allowed."},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['get'])
    def public(self, request, slug=None):
        """Public endpoint to get form structure by slug"""
        form = get_object_or_404(FormSchema, slug=slug)
        serializer = self.get_serializer(form)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def submissions(self, request, slug=None):
        """Get all submissions for a specific form"""
        form = self.get_object()
        submissions = form.submissions.all()

        search = request.query_params.get('search', None)
        if search:
            submissions = submissions.filter(data__icontains=search)

        for key, value in request.query_params.items():
            if key.startswith('filter_'):
                field_id = key.replace('filter_', '')
                submissions = submissions.filter(data__contains={field_id: value})

        serializer = FormSubmissionListSerializer(submissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related_data(self, request, slug=None):
        """Get related form data for dropdowns"""
        target_slug = request.query_params.get('target_slug')
        display_field = request.query_params.get('display_field')

        if not target_slug:
            return Response({'error': 'target_slug parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_form = get_object_or_404(FormSchema, slug=target_slug)
        submissions = target_form.submissions.all()

        options = []
        for submission in submissions:
            if display_field in submission.data:
                options.append({'id': submission.id, 'label': submission.data[display_field]})

        return Response(options)


class FormSubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for form submissions.
    
    - list: Get all submissions (filtered by user's forms)
    - create: Submit a new form response (public - no authentication required)
    - retrieve: Get a specific submission
    """
    queryset = FormSubmission.objects.all()
    serializer_class = FormSubmissionSerializer

    def get_permissions(self):
        """Allow public submissions for create action"""
        if self.action == 'create':
            return []  # No authentication required for submissions
        return [IsAuthenticated()]  # Other actions require auth

    def get_queryset(self):
        """Only show submissions for forms the user owns"""
        if self.request.user.is_authenticated:
            return FormSubmission.objects.filter(form_schema__created_by=self.request.user)
        return FormSubmission.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Handle form submission - public endpoint, no authentication required
        Accepts files via multipart/form-data. Expects file fields to be named as 'file__<field_id>' (e.g., file__image1).
        """
        from .models import FormSubmissionFile

        slug = request.data.get('slug')
        if not slug:
            return Response({'error': 'Form slug is required'}, status=status.HTTP_400_BAD_REQUEST)

        form_schema = get_object_or_404(FormSchema, slug=slug)

        # Parse JSON data if sent as string
        import json
        data = request.data.get('data', {})
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                data = {}

        submission_data = {
            'form_schema': form_schema.id,
            'data': data,
            'ip_address': self.get_client_ip(request)
        }

        # Only add submitted_by if user is authenticated
        if request.user.is_authenticated:
            submission_data['submitted_by'] = request.user.id

        serializer = self.get_serializer(data=submission_data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # Handle file uploads: expect files as file__<field_id>
        for key, file in request.FILES.items():
            if key.startswith('file__'):
                field_id = key.replace('file__', '', 1)
                FormSubmissionFile.objects.create(
                    submission=submission,
                    field_id=field_id,
                    file=file
                )

        return Response(
            {'message': 'Form submitted successfully', 'submission_id': submission.id},
            status=status.HTTP_201_CREATED
        )

    def get_client_ip(self, request):
        """Extract client IP from request headers"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
