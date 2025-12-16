from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)

class Product(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    current_stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class StockHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_history")
    change_type = models.CharField(max_length=50)  # purchase, sale, return, manual_update
    quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="price_history")
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)
