from django.contrib import admin
from .models import ProductForm, Sales, Dashboard


@admin.register(ProductForm)
class ProductFormAdmin(admin.ModelAdmin):
    list_display = ['product_id', 'product_name', 'product_type', 'sellable', 'user', 'created_at']
    list_filter = ['product_type', 'sellable', 'created_at']
    search_fields = ['product_name', 'product_type']
    readonly_fields = ['product_id', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('product_name', 'product_type', 'sellable', 'image_path', 'user')
        }),
        ('Form Integration', {
            'fields': ('form_schema', 'custom_fields')
        }),
        ('Metadata', {
            'fields': ('product_id', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Sales)
class SalesAdmin(admin.ModelAdmin):
    list_display = ['sales_id', 'product', 'sales_amount', 'quantity', 'customer_name', 'sale_date']
    list_filter = ['sale_date', 'product']
    search_fields = ['customer_name', 'product__product_name']
    readonly_fields = ['sales_id', 'sale_date']
    date_hierarchy = 'sale_date'


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ['dashboard_id', 'product_name', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'user']
    search_fields = ['product_name', 'user__username']
    readonly_fields = ['dashboard_id', 'created_at', 'updated_at']
