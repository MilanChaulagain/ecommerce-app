#!/usr/bin/env python
"""
Quick script to create an admin user
Run with: python manage.py shell < create_admin.py
"""
from django.contrib.auth.models import User
from users.models import UserRole

# Create or get superuser
username = 'admin'
email = 'admin@example.com'
password = 'admin123'

user, created = User.objects.get_or_create(
    username=username,
    defaults={'email': email, 'is_staff': True, 'is_superuser': True}
)

if created:
    user.set_password(password)
    user.save()
    print(f"✅ Created user: {username}")
else:
    print(f"⚠️ User {username} already exists")

# Create or update UserRole
role, role_created = UserRole.objects.get_or_create(
    user=user,
    defaults={'role': 'superemployee'}
)

if not role_created and role.role != 'superemployee':
    role.role = 'superemployee'
    role.save()
    print(f"✅ Updated role to: superemployee")
elif role_created:
    print(f"✅ Created UserRole: superemployee")
else:
    print(f"✅ UserRole already set: {role.role}")

print(f"\n🎉 Admin Login Credentials:")
print(f"   Email: {email}")
print(f"   Password: {password}")
print(f"   Role: {role.role}")
print(f"\n Login at: http://localhost:3000/admin/login")
