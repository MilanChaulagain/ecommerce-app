from rest_framework import serializers
from products.models import ProductForm 
from .models import SearchLog

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductForm  
        fields = ['product_id', 'product_name', 'product_type', 'price', 'sellable', 'user']
