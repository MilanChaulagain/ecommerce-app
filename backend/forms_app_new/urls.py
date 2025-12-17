from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FormSchemaViewSet, FormSubmissionViewSet

router = DefaultRouter()
router.register(r'forms', FormSchemaViewSet, basename='form')
router.register(r'submissions', FormSubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]
