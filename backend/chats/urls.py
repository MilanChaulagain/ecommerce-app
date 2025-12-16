from django.urls import path
from .views import ChatHistoryAPI

urlpatterns = [
    path('chat/<int:user_id>/', ChatHistoryAPI.as_view(), name='chat_history'),
]
