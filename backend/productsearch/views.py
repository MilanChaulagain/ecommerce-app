from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SearchLog
from .serializers import ProductSerializer


class SearchProductsAPI(APIView):
    def get(self, request):
        keyword = request.GET.get("q", "")
        
        
        from products.models import Product

        results = Product.objects.filter(name__icontains=keyword)

        SearchLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            query=keyword,
            results_count=results.count()
        )

        serializer = ProductSerializer(results, many=True)
        return Response(serializer.data)
