from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
