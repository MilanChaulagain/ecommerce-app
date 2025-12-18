from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import ProfileField, ProfileValue


class UserHomeAPITest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email='tester@example.com', password='pass123')
        # create some profile fields
        self.field1 = ProfileField.objects.create(user=self.user, label='Full Name', field_type='text', required=True, order=1)
        self.field2 = ProfileField.objects.create(user=self.user, label='Phone', field_type='text', required=True, order=2)
        self.field3 = ProfileField.objects.create(user=self.user, label='Bio', field_type='textarea', required=False, order=3)
        # create one value
        self.value1 = ProfileValue.objects.create(user=self.user, field=self.field1, value='Test User')

    def test_user_home_contains_new_keys(self):
        client = APIClient()
        client.force_authenticate(self.user)
        resp = client.get('/api/user/home/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('profile_preview', data)
        self.assertIn('missing_required_fields', data)
        self.assertIn('suggestions', data)
        # profile_preview should contain at least the field we saved
        preview = data['profile_preview']
        self.assertTrue(any(p['field_label'] == 'Full Name' and p['value'] == 'Test User' for p in preview))
        # missing_required_fields should list 'Phone'
        missing = [m['label'] for m in data['missing_required_fields']]
        self.assertIn('Phone', missing)

    def test_role_from_group_is_returned(self):
        """If user has a group (role), ensure it's reflected in the home payload"""
        from django.contrib.auth.models import Group
        grp, _ = Group.objects.get_or_create(name='superemployee')
        self.user.groups.add(grp)
        client = APIClient()
        client.force_authenticate(self.user)
        resp = client.get('/api/user/home/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['user']['role'], 'superemployee')
        self.assertTrue(isinstance(data['user'].get('groups'), list))
        self.assertTrue(any(g['name'] == 'superemployee' for g in data['user'].get('groups', [])))
