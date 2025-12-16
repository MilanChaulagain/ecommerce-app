from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, StockHistory
from .serializers import ProductSerializer, StockHistorySerializer

# List all products
class ProductListAPI(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

# Get product detail
class ProductDetailAPI(APIView):
    def get(self, request, pk):
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

# Add product
class AddProductAPI(APIView):
    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update stock
class UpdateStockAPI(APIView):
    def post(self, request, pk):
        product = Product.objects.get(id=pk)
        qty = int(request.data.get("quantity", 0))
        change_type = request.data.get("change_type", "manual_update")
        
        product.current_stock += qty
        product.save()

        StockHistory.objects.create(
            product=product,
            change_type=change_type,
            quantity=qty
        )
        return Response({"message": "Stock updated successfully"})

# Get stock history
class StockHistoryAPI(APIView):
    def get(self, request, pk):
        product = Product.objects.get(id=pk)
        history = product.stock_history.all()
        serializer = StockHistorySerializer(history, many=True)
        return Response(serializer.data)

# Low stock alert
class LowStockAPI(APIView):
    def get(self, request):
        threshold = int(request.GET.get("threshold", 5))
        low_stock_products = Product.objects.filter(current_stock__lte=threshold)
        serializer = ProductSerializer(low_stock_products, many=True)
        return Response(serializer.data)
