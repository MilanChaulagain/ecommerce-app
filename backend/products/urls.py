from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductFormViewSet, SalesViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'products', ProductFormViewSet, basename='product')
router.register(r'sales', SalesViewSet, basename='sales')
router.register(r'dashboards', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
