from django.http import HttpResponseForbidden
from .models import PagePermission


class PagePermissionMiddleware:
    """Middleware that enforces PagePermission rules for incoming requests.

    Checks active PagePermission entries and denies access if the user
    is not in allowed_users and does not have an allowed role.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        # fetch active permissions
        perms = PagePermission.objects.filter(active=True)
        for p in perms:
            try:
                match = False
                if p.prefix:
                    if path.startswith(p.path):
                        match = True
                else:
                    if path == p.path:
                        match = True
                if not match:
                    continue

                # matched - check allowed users
                user = request.user
                if user and user.is_authenticated:
                    if p.allowed_users.filter(id=user.id).exists():
                        # allowed explicitly
                        return self.get_response(request)
                    # check role
                    try:
                        user_role = getattr(user, 'userrole').role
                    except Exception:
                        user_role = 'user'
                    if user.is_superuser or user_role in p.allowed_roles_list():
                        return self.get_response(request)
                # not allowed
                return HttpResponseForbidden('You do not have permission to access this page')
            except Exception:
                # if any error while checking a rule, skip that rule
                continue

        return self.get_response(request)
