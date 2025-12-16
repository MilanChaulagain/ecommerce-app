from django.urls import path
from .views import ProductListAPI, ProductDetailAPI, AddProductAPI, UpdateStockAPI, StockHistoryAPI, LowStockAPI

urlpatterns = [
    path('products/', ProductListAPI.as_view()),
    path('products/<int:pk>/', ProductDetailAPI.as_view()),
    path('products/add/', AddProductAPI.as_view()),
    path('products/<int:pk>/stock/', UpdateStockAPI.as_view()),
    path('products/<int:pk>/history/', StockHistoryAPI.as_view()),
    path('products/low-stock/', LowStockAPI.as_view()),
]
