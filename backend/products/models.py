from django.db import models
from django.contrib.auth.models import User


class ProductForm(models.Model):
    """
    Represents a product with form-based attributes.
    Integrates with the dynamic form builder for custom product fields.
    """
    SELLABLE_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
    ]
    
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=100)
    sellable = models.CharField(max_length=3, choices=SELLABLE_CHOICES, default='yes')
    created_at = models.DateTimeField(auto_now_add=True)
    image_path = models.CharField(max_length=500, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    
    # Link to dynamic form schema for custom product attributes
    form_schema = models.ForeignKey(
        'forms_app.FormSchema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        help_text='Associated form schema for custom product fields'
    )
    
    # Store custom form data as JSON
    custom_fields = models.JSONField(
        default=dict,
        blank=True,
        help_text='Custom product attributes from form builder'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['product_type']),
            models.Index(fields=['sellable']),
        ]
    
    def __str__(self):
        return f"{self.product_name} ({self.product_type})"


class Sales(models.Model):
    """
    Tracks sales data for products.
    """
    sales_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        ProductForm,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    sales_amount = models.DecimalField(max_digits=12, decimal_places=2)
    sale_date = models.DateTimeField(auto_now_add=True)
    quantity = models.IntegerField(default=1)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-sale_date']
        verbose_name_plural = 'Sales'
        indexes = [
            models.Index(fields=['product', '-sale_date']),
        ]
    
    def __str__(self):
        return f"Sale #{self.sales_id} - {self.product.product_name} - ${self.sales_amount}"


class Dashboard(models.Model):
    """
    User dashboards for viewing and analyzing products and sales.
    """
    dashboard_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        ProductForm,
        on_delete=models.CASCADE,
        related_name='dashboards'
    )
    product_name = models.CharField(max_length=255)  # Denormalized for quick access
    sales_table = models.CharField(max_length=255, help_text='Reference to sales table/view')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Dashboard configuration
    config = models.JSONField(
        default=dict,
        help_text='Dashboard layout and widget configuration'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"Dashboard for {self.product_name} by {self.user.username}"
