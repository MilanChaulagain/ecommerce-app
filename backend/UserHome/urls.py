from . import views
from django.urls import path
app_name = 'UserHome'

urlpatterns = [
    # Dashboard
    path('home/', views.user_home, name='user_home'),
    
    # Profile Fields Management
    path('profile-fields/', views.profile_fields, name='profile_fields'),
    path('profile-fields/<int:field_id>/', views.profile_field_detail, name='profile_field_detail'),
    
    # Profile Form & Data
    path('profile-form/', views.profile_form, name='profile_form'),
    path('profile/save/', views.save_profile, name='save_profile'),
    path('profile/upload/', views.upload_profile_picture, name='upload_profile_picture'),
    path('profile/view/', views.view_profile, name='view_profile'),
    path('profile/value/<int:value_id>/', views.delete_profile_value, name='delete_profile_value'),
]