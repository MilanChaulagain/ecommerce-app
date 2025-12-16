from django.db import models
from products.models import ProductForm
from django.contrib.auth.models import User

class SearchLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    query = models.CharField(max_length=255)
    results_count = models.IntegerField()
    searched_at = models.DateTimeField(auto_now_add=True)
    product = models.ForeignKey(ProductForm, on_delete=models.CASCADE, null=True) 
