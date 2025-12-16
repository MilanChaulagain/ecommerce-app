from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer

class ChatHistoryAPI(APIView):
    def get(self, request, user_id):
        messages = ChatMessage.objects.filter(user_id=user_id)
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
