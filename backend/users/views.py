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
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import permission_classes
from rest_framework import generics
from django.contrib.auth.models import User

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
        state = request.query_params.get('state')
        
        # Extract code_verifier from state parameter
        code_verifier = None
        if state:
            try:
                import json
                import base64
                state_data = json.loads(base64.b64decode(state))
                code_verifier = state_data.get('code_verifier')
                print(f"Extracted code_verifier from state: {code_verifier[:10]}..." if code_verifier else "No code_verifier in state")
            except Exception as e:
                print(f"Failed to parse state parameter: {e}")
        
        if not code:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            error_redirect = f"{frontend_url}/auth/callback?provider=tiktok&error=missing_code&message=Authorization code is required"
            return redirect(error_redirect)
        
        # Use the exact redirect_uri that was registered with TikTok (no query params)
        redirect_uri = os.getenv('TIKTOK_REDIRECT_URI', f"{request.scheme}://{request.get_host()}/api/users/social/tiktok/callback/")
        
        # TikTok v2 API uses different endpoint and format
        token_url = "https://open.tiktokapis.com/v2/oauth/token/"
        
        # TikTok v2 requires application/x-www-form-urlencoded with specific headers
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'
        }
        
        data = {
            "client_key": os.getenv("TIKTOK_CLIENT_KEY"),
            "client_secret": os.getenv("TIKTOK_CLIENT_SECRET"),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        # Note: TikTok does NOT accept code_verifier in token exchange
        # PKCE is only used during authorization (code_challenge)
        # Do not add code_verifier here - it causes error 10002
        
        # Log the request details for debugging
        print("=" * 60)
        print("TikTok Token Exchange Request:")
        print(f"URL: {token_url}")
        print(f"Headers: {headers}")
        print(f"Request Data:")
        print(f"  client_key: {data.get('client_key', 'NOT SET')}")
        print(f"  client_secret: {'*' * 20 if data.get('client_secret') else 'NOT SET'}")
        print(f"  code: {code[:20]}..." if code and len(code) > 20 else f"  code: {code}")
        print(f"  grant_type: {data['grant_type']}")
        print(f"  redirect_uri: {redirect_uri}")
        print("=" * 60)
        
        try:
            token_resp = requests.post(token_url, data=data, headers=headers).json()
            
            # Log full response for debugging
            print("TikTok Token Response:")
            print(token_resp)
            print("=" * 60)
            
            # Check for errors in response
            if 'error' in token_resp:
                error_msg = token_resp.get('error_description', token_resp.get('error', 'Unknown error'))
                print(f"TikTok OAuth Error: {error_msg}")
                print(f"Full error response: {token_resp}")
                
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                error_redirect = f"{frontend_url}/auth/callback?provider=tiktok&error=token_exchange_failed&message={error_msg}"
                return redirect(error_redirect)
            
            # TikTok v2 API returns tokens at root level, not under 'data'
            access_token = token_resp.get('access_token')
            open_id = token_resp.get('open_id')
            
            if not access_token:
                print(f"No access token in response: {token_resp}")
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                error_redirect = f"{frontend_url}/auth/callback?provider=tiktok&error=no_access_token&message=Failed to get access token from TikTok"
                return redirect(error_redirect)
        except Exception as e:
            print(f"TikTok API Exception: {str(e)}")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            error_redirect = f"{frontend_url}/auth/callback?provider=tiktok&error=api_exception&message={str(e)}"
            return redirect(error_redirect)
        
        # TikTok v2 API user info endpoint
        user_info_url = "https://open.tiktokapis.com/v2/user/info/"
        user_info_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        user_info_params = {
            'fields': 'open_id,union_id,avatar_url,display_name'
        }
        
        user_info_response = requests.get(user_info_url, headers=user_info_headers, params=user_info_params).json()
        user_info = user_info_response.get('data', {}).get('user', {})
        
        username = user_info.get('display_name') or f"tiktok_{open_id}"
        email = f"{username.replace(' ', '_')}@tiktok.com"

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
        
        # Log incoming request
        print("=" * 60)
        print("Facebook OAuth Callback Received")
        print(f"Code: {code[:20]}..." if code else "Code: None")
        print(f"Full URL: {request.build_absolute_uri()}")
        print("=" * 60)
        
        if not code:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            error_redirect = f"{frontend_url}/auth/callback?provider=facebook&error=missing_code&message=Authorization code is required"
            return redirect(error_redirect)
        
        # Prepare token exchange request
        redirect_uri = os.getenv("FB_REDIRECT_URI")
        token_url = "https://graph.facebook.com/v17.0/oauth/access_token"
        params = {
            "client_id": os.getenv("FB_APP_ID"),
            "client_secret": os.getenv("FB_APP_SECRET"),
            "redirect_uri": redirect_uri,
            "code": code
        }
        
        # Log token exchange request
        print("Facebook Token Exchange Request:")
        print(f"URL: {token_url}")
        print(f"Client ID: {params['client_id']}")
        print(f"Redirect URI: {redirect_uri}")
        print(f"Code: {code[:20]}...")
        print("=" * 60)
        
        try:
            token_resp = requests.get(token_url, params=params).json()
            
            # Log full response
            print("Facebook Token Response:")
            print(token_resp)
            print("=" * 60)
            
            access_token = token_resp.get("access_token")
            
            if not access_token:
                # Check for error in response
                error_msg = token_resp.get('error', {}).get('message', 'Unknown error')
                print(f"Facebook Error: {error_msg}")
                
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                error_redirect = f"{frontend_url}/auth/callback?provider=facebook&error=token_exchange_failed&message={error_msg}"
                return redirect(error_redirect)
            
            # Fetch user info
            user_info_url = "https://graph.facebook.com/me"
            user_info = requests.get(user_info_url, params={
                "access_token": access_token, 
                "fields": "id,name,email"
            }).json()
            
            print("Facebook User Info:")
            print(user_info)
            print("=" * 60)
            
            username = user_info.get('name')
            email = user_info.get('email') or f"{username.replace(' ', '_')}@facebook.com"

            user = get_or_create_user(username, email)
            tokens = generate_jwt(user)
            
            # Redirect to frontend callback with tokens
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            redirect_url = f"{frontend_url}/auth/callback?provider=facebook&code=success&access_token={tokens['access']}&refresh_token={tokens['refresh']}"
            return redirect(redirect_url)
            
        except Exception as e:
            print(f"Exception in Facebook OAuth: {str(e)}")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            error_redirect = f"{frontend_url}/auth/callback?provider=facebook&error=api_exception&message={str(e)}"
            return redirect(error_redirect)

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


class UsersListView(APIView):
    """List all users (admin only)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().select_related()
        data = []
        for u in users:
            try:
                role = UserRole.objects.get(user=u).role
            except UserRole.DoesNotExist:
                role = 'user'
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'role': role,
            })
        return Response({'count': len(data), 'results': data})


class SetUserRoleView(APIView):
    """Set a user's role (admin only)"""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        role = request.data.get('role')
        if role not in dict(UserRole.ROLE_CHOICES):
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        userrole, _ = UserRole.objects.get_or_create(user=user)
        userrole.role = role
        userrole.save()
        return Response({'message': 'Role updated', 'user': {'id': user.id, 'username': user.username, 'role': userrole.role}})
