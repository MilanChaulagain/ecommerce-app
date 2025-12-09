from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    TikTokLoginCallback, 
    FacebookLoginCallback, 
    InstagramLoginCallback,
    CurrentUserView,
    UserRegistrationView,
    LogoutView,
    EmailTokenObtainPairView
)

urlpatterns = [
    # JWT Authentication
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Current user profile
    path('me/', CurrentUserView.as_view(), name='current_user'),
    
    # Social Authentication callbacks
    path('social/tiktok/callback/', TikTokLoginCallback.as_view(), name='tiktok-callback'),
    path('social/facebook/callback/', FacebookLoginCallback.as_view(), name='facebook-callback'),
    path('social/instagram/callback/', InstagramLoginCallback.as_view(), name='instagram-callback'),
]
