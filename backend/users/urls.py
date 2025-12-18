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
from .views import UsersListView, SetUserRoleView
from .views import PagePermissionListCreateView, PagePermissionDetailView

urlpatterns = [
    # JWT Authentication
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Current user profile
    path('me/', CurrentUserView.as_view(), name='current_user'),

    # Admin user management
    path('', UsersListView.as_view(), name='users_list'),
    path('<int:user_id>/role/', SetUserRoleView.as_view(), name='set_user_role'),
    # Page permission management (admin / superemployee)
    path('page-permissions/', PagePermissionListCreateView.as_view(), name='page_permissions_list'),
    path('page-permissions/<int:pk>/', PagePermissionDetailView.as_view(), name='page_permissions_detail'),
    
    # Social Authentication callbacks
    path('social/tiktok/callback/', TikTokLoginCallback.as_view(), name='tiktok-callback'),
    path('social/facebook/callback/', FacebookLoginCallback.as_view(), name='facebook-callback'),
    path('social/instagram/callback/', InstagramLoginCallback.as_view(), name='instagram-callback'),
]
