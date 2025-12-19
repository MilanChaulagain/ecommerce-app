#!/usr/bin/env python
"""
Quick script to create an employee user
Run with: python manage.py shell < create_employee.py

Optional environment variables:
  EMP_USERNAME (default: employee)
  EMP_EMAIL    (default: employee@example.com)
  EMP_PASSWORD (default: employee123)
  EMP_ROLE     (default: employee)  # e.g. salesemployee, contentcreator
"""
import os
from django.contrib.auth.models import User
from users.models import UserRole

username = os.environ.get('EMP_USERNAME', 'employee')
email = os.environ.get('EMP_EMAIL', 'employee@example.com')
password = os.environ.get('EMP_PASSWORD', 'employee123')
role_name = os.environ.get('EMP_ROLE', 'employee')

# Create or get user
user, created = User.objects.get_or_create(
    username=username,
    defaults={'email': email, 'is_staff': False, 'is_superuser': False}
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
    defaults={'role': role_name}
)

if not role_created and role.role != role_name:
    role.role = role_name
    role.save()
    print(f"✅ Updated role to: {role_name}")
elif role_created:
    print(f"✅ Created UserRole: {role_name}")
else:
    print(f"✅ UserRole already set: {role.role}")

print(f"\n🎉 Employee Login Credentials:")
print(f"   Username: {username}")
print(f"   Email: {email}")
print(f"   Password: {password}")
print(f"   Role: {role.role}")
print(f"\nRun login at: http://localhost:3000/account or admin login at /admin/login")
