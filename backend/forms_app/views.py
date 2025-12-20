from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import FormSchema, FormSubmission, FormFile
from .serializers import (
    FormSchemaSerializer, 
    FormSubmissionSerializer,
    FormSubmissionListSerializer,
    # FormFileSerializer if needed
)
from users.permissions import IsSuperEmployee
from django.db import transaction, IntegrityError, connection


class FormSchemaViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing form schemas.
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
            # Allow superusers or super employees to see all forms
            try:
                if self.request.user.is_superuser or IsSuperEmployee().has_permission(self.request, self):
                    return FormSchema.objects.all()
            except Exception:
                pass
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
        """Allow deletion for superusers or IsSuperEmployee; otherwise forbid."""
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        # Allow superuser or users passing IsSuperEmployee permission
        has_super_emp = False
        try:
            has_super_emp = IsSuperEmployee().has_permission(request, self)
        except Exception:
            has_super_emp = False

        if not (request.user.is_superuser or has_super_emp):
            return Response({"error": "Only superusers or super employees can delete forms."}, status=status.HTTP_403_FORBIDDEN)

        # Perform deletion: remove related files and submissions first to avoid FK integrity errors
        form = get_object_or_404(FormSchema, slug=kwargs.get('slug'))
        try:
            # First, remove files and submissions inside a transaction and commit
            with transaction.atomic():
                files_qs = FormFile.objects.filter(submission__form_schema=form)
                submissions_qs = FormSubmission.objects.filter(form_schema=form)

                # Debug counts before deletion
                files_count_before = files_qs.count()
                subs_count_before = submissions_qs.count()
                print(f"[form-delete] starting delete for form={form.slug} files_before={files_count_before} subs_before={subs_count_before}")

                # Try to remove files from storage first (ignore storage errors)
                for f in files_qs:
                    try:
                        if getattr(f, 'file', None):
                            f.file.delete(save=False)
                    except Exception as ex:
                        print(f"[form-delete] storage delete failed for file id={f.id}: {ex}")
                        pass

                # Delete file records and submissions
                deleted_files = files_qs.delete()
                deleted_subs = submissions_qs.delete()

                files_count_after_files_delete = FormFile.objects.filter(submission__form_schema=form).count()
                subs_count_after = FormSubmission.objects.filter(form_schema=form).count()
                print(f"[form-delete] files_deleted={deleted_files} files_remaining_after_files_delete={files_count_after_files_delete}")
                print(f"[form-delete] subs_deleted={deleted_subs} subs_remaining_after_subs_delete={subs_count_after}")

            # At this point the deletions are committed. Delete the form in a separate step.
            try:
                # Refresh instance to ensure it's up-to-date
                form.refresh_from_db()
            except Exception:
                # form may still exist; ignore refresh errors
                pass

            try:
                form.delete()
            except IntegrityError as e:
                # If deletion still fails, return helpful error
                return Response({"error": "Integrity error while deleting form", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": "Failed to delete form", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    """
    queryset = FormSubmission.objects.all()
    serializer_class = FormSubmissionSerializer
    # Default: require authentication for most actions, but allow public submission (create)
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """Allow unauthenticated users to create (submit) forms, but require auth for other actions."""
        if self.action == 'create':
            return [AllowAny()]
        return [perm() for perm in self.permission_classes]

    def get_queryset(self):
        """Only show submissions for forms the user owns"""
        if self.request.user.is_authenticated:
            return FormSubmission.objects.filter(form_schema__created_by=self.request.user)
        return FormSubmission.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Handle form submission (can be public if you remove authentication requirement)
        """
        slug = request.data.get('slug')
        if not slug:
            return Response({'error': 'Form slug is required'}, status=status.HTTP_400_BAD_REQUEST)

        form_schema = get_object_or_404(FormSchema, slug=slug)

        submission_data = {
            'form_schema': form_schema.id,
            'data': request.data.get('data', {}),
            'ip_address': self.get_client_ip(request)
        }

        if request.user.is_authenticated:
            submission_data['submitted_by'] = request.user.id

        serializer = self.get_serializer(data=submission_data)
        if not serializer.is_valid():
            # Log errors to server console for debugging
            print("Form submission validation errors:", serializer.errors)
            return Response({
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Save and return the created submission instance
        submission = serializer.save()

        # Handle any uploaded files in request.FILES (support FormData uploads)
        for file_key, uploaded in request.FILES.items():
            # uploaded may be an UploadedFile or list-like; handle both
            if hasattr(uploaded, 'read'):
                FormFile.objects.create(submission=submission, file=uploaded)
            else:
                # If multiple files under same key
                try:
                    for f in uploaded:
                        FormFile.objects.create(submission=submission, file=f)
                except Exception:
                    pass

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

    def destroy(self, request, *args, **kwargs):
        """Safely delete a submission: remove files first, commit, then delete the submission."""
        submission = self.get_object()
        try:
            # Delete files (storage + DB) in a transaction and commit
            files_qs = FormFile.objects.filter(submission=submission)
            files_list = list(files_qs)
            files_count_before = len(files_list)
            print(f"[submission-delete] submission={submission.id} files_before={files_count_before}")
            # Try to delete storage files first
            for f in files_list:
                try:
                    if getattr(f, 'file', None):
                        f.file.delete(save=False)
                except Exception as ex:
                    print(f"[submission-delete] storage delete failed for file id={f.id}: {ex}")

            # Ensure DB rows removed - use transaction for safety
            with transaction.atomic():
                # Use raw SQL delete to ensure all rows removed regardless of ORM state
                with connection.cursor() as cursor:
                    cursor.execute('DELETE FROM forms_app_formsubmissionfile WHERE submission_id = %s', [submission.id])
                # double-check
                remaining = FormFile.objects.filter(submission=submission).count()
                print(f"[submission-delete] files_deleted_db rows_remaining={remaining}")

            # Now delete the submission itself
            try:
                submission.delete()
            except IntegrityError as e:
                # If deletion still fails, report remaining referencing rows for debugging
                refs = list(FormFile.objects.filter(submission=submission).values_list('id', flat=True))
                print(f"[submission-delete] IntegrityError deleting submission id={submission.id}, remaining file refs={refs}")
                return Response({"error": "Integrity error while deleting submission", "detail": str(e), "remaining_file_ids": refs}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": "Failed to delete submission", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
