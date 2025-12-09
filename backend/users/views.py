import os
import requests
from dotenv import load_dotenv
from django.contrib.auth.models import User
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserRole
from .serializers import UserSerializer

load_dotenv()

def get_or_create_user(username, email, role='user'):
    user, _ = User.objects.get_or_create(username=username, defaults={'email': email})
    userrole, _ = UserRole.objects.get_or_create(user=user, defaults={'role': role})
    return user

def generate_jwt(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}

# ---------------- TikTok ----------------
class TikTokLoginCallback(APIView):
    def get(self, request):
        code = request.query_params.get('code')
        code_verifier = request.query_params.get('code_verifier')
        
        if not code:
            return Response({"error": "Authorization code is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        token_url = "https://open-api.tiktok.com/oauth/access_token/"
        data = {
            "client_key": os.getenv("TIKTOK_CLIENT_KEY"),
            "client_secret": os.getenv("TIKTOK_CLIENT_SECRET"),
            "code": code,
            "grant_type": "authorization_code"
        }
        
        # Add code_verifier for PKCE if provided
        if code_verifier:
            data["code_verifier"] = code_verifier
        
        token_resp = requests.post(token_url, data=data).json()
        access_token = token_resp.get('data', {}).get('access_token')
        open_id = token_resp.get('data', {}).get('open_id')
        if not access_token:
            return Response({"error": "Failed to get TikTok access token"}, status=status.HTTP_400_BAD_REQUEST)
        
        user_info_url = f"https://open-api.tiktok.com/oauth/userinfo/?access_token={access_token}&open_id={open_id}"
        user_info = requests.get(user_info_url).json().get('data', {})
        username = user_info.get('display_name') or f"tiktok_{open_id}"
        email = user_info.get('email') or f"{username}@tiktok.com"

        user = get_or_create_user(username, email)
        tokens = generate_jwt(user)
        
        # Redirect to frontend callback with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/callback?provider=tiktok&code=success&access_token={tokens['access']}&refresh_token={tokens['refresh']}"
        return redirect(redirect_url)

# ---------------- Facebook ----------------
class FacebookLoginCallback(APIView):
    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "Authorization code is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        token_url = "https://graph.facebook.com/v17.0/oauth/access_token"
        params = {
            "client_id": os.getenv("FB_APP_ID"),
            "client_secret": os.getenv("FB_APP_SECRET"),
            "redirect_uri": os.getenv("FB_REDIRECT_URI"),
            "code": code
        }
        token_resp = requests.get(token_url, params=params).json()
        access_token = token_resp.get("access_token")
        if not access_token:
            return Response({"error": "Failed to get Facebook access token"}, status=status.HTTP_400_BAD_REQUEST)

        user_info_url = "https://graph.facebook.com/me"
        user_info = requests.get(user_info_url, params={"access_token": access_token, "fields": "id,name,email"}).json()
        username = user_info.get('name')
        email = user_info.get('email') or f"{username}@facebook.com"

        user = get_or_create_user(username, email)
        tokens = generate_jwt(user)
        
        # Redirect to frontend callback with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/callback?provider=facebook&code=success&access_token={tokens['access']}&refresh_token={tokens['refresh']}"
        return redirect(redirect_url)

# ---------------- Instagram ----------------
class InstagramLoginCallback(APIView):
    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "Authorization code is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        token_url = "https://api.instagram.com/oauth/access_token"
        data = {
            "client_id": os.getenv("IG_APP_ID"),
            "client_secret": os.getenv("IG_APP_SECRET"),
            "grant_type": "authorization_code",
            "redirect_uri": os.getenv("IG_REDIRECT_URI"),
            "code": code
        }
        token_resp = requests.post(token_url, data=data).json()
        access_token = token_resp.get("access_token")
        user_id = token_resp.get("user_id")
        if not access_token:
            return Response({"error": "Failed to get Instagram access token"}, status=status.HTTP_400_BAD_REQUEST)

        user_info_url = f"https://graph.instagram.com/{user_id}?fields=id,username"
        user_info = requests.get(user_info_url, params={"access_token": access_token}).json()
        username = user_info.get('username')
        email = f"{username}@instagram.com"

        user = get_or_create_user(username, email)
        tokens = generate_jwt(user)
        
        # Redirect to frontend callback with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/callback?provider=instagram&code=success&access_token={tokens['access']}&refresh_token={tokens['refresh']}"
        return redirect(redirect_url)


# ---------------- New Authentication Endpoints ----------------

class CurrentUserView(APIView):
    """Get current authenticated user information"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        try:
            role_obj = UserRole.objects.get(user=user)
            role = role_obj.role
        except UserRole.DoesNotExist:
            role = 'user'
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
        })


class UserRegistrationView(APIView):
    """Register a new user"""
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all([username, email, password]):
            return Response(
                {'error': 'Username, email, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Create UserRole
        UserRole.objects.create(user=user, role='user')
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': 'user',
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Logout user by blacklisting refresh token"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class EmailTokenObtainPairView(APIView):
    """Custom JWT login that accepts email instead of username"""
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get user role
        try:
            role_obj = UserRole.objects.get(user=user)
            role = role_obj.role
        except UserRole.DoesNotExist:
            role = 'user'
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': role,
            }
        })
