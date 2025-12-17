from rest_framework import serializers
from .models import ProductForm, Sales, Dashboard
# Try importing FormSchemaSerializer from current app name, support fallback if project uses 'forms_app_new'
try:
    from forms_app.serializers import FormSchemaSerializer
except ImportError:
    try:
        from forms_app_new.serializers import FormSchemaSerializer
    except ImportError as exc:
        # Provide a clear error if neither module is available
        raise ImportError(
            "Could not import FormSchemaSerializer from 'forms_app' or 'forms_app_new'.\n"
            "Make sure one of these packages exists and is on PYTHONPATH, and is listed in INSTALLED_APPS."
        ) from exc


class ProductFormSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    form_schema_details = FormSchemaSerializer(source='form_schema', read_only=True)
    total_sales = serializers.SerializerMethodField()
    sales_count = serializers.IntegerField(source='sales.count', read_only=True)
    
    class Meta:
        model = ProductForm
        fields = [
            'product_id', 'product_name', 'product_type', 'sellable',
            'created_at', 'image_path', 'user', 'user_username',
            'form_schema', 'form_schema_details', 'custom_fields',
            'total_sales', 'sales_count'
        ]
        read_only_fields = ['product_id', 'created_at', 'user']  # user is read-only now
    
    def get_total_sales(self, obj):
        return sum(sale.sales_amount for sale in obj.sales.all())



class SalesSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_type = serializers.CharField(source='product.product_type', read_only=True)
    
    class Meta:
        model = Sales
        fields = [
            'sales_id', 'product', 'product_name', 'product_type',
            'sales_amount', 'sale_date', 'quantity', 'customer_name'
        ]
        read_only_fields = ['sales_id', 'sale_date']


class DashboardSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    product_details = ProductFormSerializer(source='product', read_only=True)
    
    class Meta:
        model = Dashboard
        fields = [
            'dashboard_id', 'product', 'product_name', 'sales_table',
            'user', 'user_username', 'created_at', 'updated_at',
            'config', 'product_details'
        ]
        read_only_fields = ['dashboard_id', 'created_at', 'updated_at']
