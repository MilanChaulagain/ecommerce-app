from rest_framework import serializers
from .models import Product, StockHistory, PriceHistory

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"

class StockHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHistory
        fields = "__all__"

class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = "__all__"
