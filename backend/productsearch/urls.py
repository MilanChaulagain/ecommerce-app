from django.urls import path
from .views import SearchProductsAPI

urlpatterns = [
    path('search/', SearchProductsAPI.as_view()),
]
