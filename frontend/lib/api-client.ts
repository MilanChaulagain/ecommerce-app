/**
 * Centralized API Client for Backend Integration
 * Handles authentication, forms, and submissions with proper typing
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== Types ====================

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'employee' | 'superemployee' | 'admin';
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SocialAuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface FormFieldStructure {
  id: string;
  type: 'text' | 'number' | 'dropdown' | 'radio' | 'checkbox';
  labels: { [languageCode: string]: string };
  descriptions?: { [languageCode: string]: string };
  required: boolean;
  options?: string[];
}

export interface FormRelationship {
  field_id: string;
  target_form_slug: string;
  display_field: string;
}

export interface FormSchema {
  id: number;
  title: string;
  slug: string;
  description: string;
  language_config: {
    primary: string;
    optional: string[];
  };
  fields_structure: FormFieldStructure[];
  relationships: FormRelationship[];
  created_by: number;
  created_at: string;
  updated_at: string;
  submission_count: number;
}

export interface CreateFormPayload {
  title: string;
  description?: string;
  language_config?: {
    primary: string;
    optional: string[];
  };
  fields_structure: FormFieldStructure[];
  relationships?: FormRelationship[];
}

export interface FormSubmission {
  id: number;
  form_schema: number;
  form_title: string;
  form_slug: string;
  data: { [fieldId: string]: any };
  submitted_at: string;
  submitted_by: number | null;
  ip_address: string;
}

export interface SubmitFormPayload {
  slug: string;
  data: { [fieldId: string]: any };
}

// ==================== Token Management ====================
export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static USER_KEY = 'user';

  static setTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// ==================== API Error Handling ====================

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, response.statusText, errorData);
  }
  return response.json();
}

// ==================== HTTP Client ====================

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {};

  // Merge existing headers if any
  if (fetchOptions.headers) {
    const existingHeaders = fetchOptions.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  if (requireAuth) {
    const token = TokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // If body is FormData, let the browser set Content-Type (including boundary)
  const bodyIsFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  if (!bodyIsFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof APIError && error.status === 401 && requireAuth) {
      // Token expired, try to refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry request with new token
        const token = TokenManager.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
        return handleResponse<T>(response);
      } else {
        // Refresh failed, clear tokens and redirect to login
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
        throw error;
      }
    }
    throw error;
  }
}

// ==================== Authentication API ====================

/**
 * Refresh access token using refresh token
 * Note: Backend needs to implement this endpoint
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      TokenManager.setTokens(data.access, refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const authAPI = {
  /**
   * Handle social auth callback
   * Backend endpoint: GET /api/users/social/{provider}/callback/?code={code}
   */
  async handleSocialCallback(
    provider: 'tiktok' | 'facebook' | 'instagram',
    code: string
  ): Promise<SocialAuthResponse> {
    const response = await request<SocialAuthResponse>(
      `/api/users/social/${provider}/callback/?code=${code}`
    );
    
    // Store tokens
    TokenManager.setTokens(response.access_token, response.refresh_token);
    TokenManager.setUser(response.user);
    
    return response;
  },

  /**
   * Login with email/password (JWT)
   * Note: Backend needs to implement this endpoint
   */
  async login(email: string, password: string): Promise<AuthTokens & { user: User }> {
    const response = await request<AuthTokens & { user: User }>(
      '/api/users/login/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    TokenManager.setTokens(response.access, response.refresh);
    TokenManager.setUser(response.user);
    
    return response;
  },

  /**
   * Get current user profile
   * Note: Backend needs to implement this endpoint
   */
  async getCurrentUser(): Promise<User> {
    return request<User>('/api/users/me/', { requireAuth: true });
  },

  /**
   * Logout (clear local tokens)
   */
  logout() {
    TokenManager.clearTokens();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  },

  /**
   * Get stored user data
   */
  getUser(): User | null {
    return TokenManager.getUser();
  },
};

// ==================== Forms API ====================

export const formsAPI = {
  /**
   * List all forms (requires auth)
   * Backend endpoint: GET /api/forms/
   */
  async listForms(): Promise<FormSchema[]> {
    return request<FormSchema[]>('/api/forms/', { requireAuth: true });
  },

  /**
   * Get form by slug
   * Backend endpoint: GET /api/forms/{slug}/
   */
  async getForm(slug: string): Promise<FormSchema> {
    return request<FormSchema>(`/api/forms/${slug}/`, { requireAuth: true });
  },

  /**
   * Get public form (no auth required)
   * Backend endpoint: GET /api/forms/{slug}/public/
   */
  async getPublicForm(slug: string): Promise<FormSchema> {
    return request<FormSchema>(`/api/forms/${slug}/public/`);
  },

  /**
   * Create new form (SuperEmployee only)
   * Backend endpoint: POST /api/forms/
   */
  async createForm(payload: CreateFormPayload): Promise<FormSchema> {
    return request<FormSchema>('/api/forms/', {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: true,
    });
  },

  /**
   * Update form by slug (SuperEmployee only)
   * Backend endpoint: PUT /api/forms/{slug}/
   */
  async updateForm(slug: string, payload: Partial<CreateFormPayload>): Promise<FormSchema> {
    return request<FormSchema>(`/api/forms/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      requireAuth: true,
    });
  },

  /**
   * Partial update form (SuperEmployee only)
   * Backend endpoint: PATCH /api/forms/{slug}/
   */
  async patchForm(slug: string, payload: Partial<CreateFormPayload>): Promise<FormSchema> {
    return request<FormSchema>(`/api/forms/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      requireAuth: true,
    });
  },

  /**
   * Get form submissions
   * Backend endpoint: GET /api/forms/{slug}/submissions/
   */
  async getFormSubmissions(
    slug: string,
    filters?: { search?: string; [key: string]: any }
  ): Promise<FormSubmission[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/forms/${slug}/submissions/?${queryString}`
      : `/api/forms/${slug}/submissions/`;

    return request<FormSubmission[]>(endpoint, { requireAuth: true });
  },

  /**
   * Get related form data for dropdowns
   * Backend endpoint: GET /api/forms/{slug}/related_data/
   */
  async getRelatedData(
    slug: string,
    targetSlug: string,
    displayField: string
  ): Promise<any[]> {
    return request<any[]>(
      `/api/forms/${slug}/related_data/?target_slug=${targetSlug}&display_field=${displayField}`,
      { requireAuth: true }
    );
  },
};

// ==================== Submissions API ====================

export const submissionsAPI = {
  /**
   * Submit form response
   * Backend endpoint: POST /api/submissions/
   * Note: Backend should allow public submissions
   */
  async submitForm(formData: FormData): Promise<FormSubmission> {
    const response = await fetch(`${API_BASE_URL}/api/submissions/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to submit form');
    return response.json();
  },

  /**
   * List all submissions (only for user's forms)
   * Backend endpoint: GET /api/submissions/
   */
  async listSubmissions(): Promise<FormSubmission[]> {
    return request<FormSubmission[]>('/api/submissions/', { requireAuth: true });
  },

  /**
   * Get specific submission
   * Backend endpoint: GET /api/submissions/{id}/
   */
  async getSubmission(id: number): Promise<FormSubmission> {
    return request<FormSubmission>(`/api/submissions/${id}/`, { requireAuth: true });
  },
};

// ==================== Groups & Dashboard API ====================
export const groupsAPI = {
  async listGroups() {
    // backend exposes roles as Role model under /api/user/roles/
    return request<any>('/api/user/roles/', { requireAuth: true });
  },
  async createGroup(payload: { name: string; description?: string }) {
    return request<any>('/api/user/roles/', { method: 'POST', body: JSON.stringify(payload), requireAuth: true });
  },
  async getGroup(id: number) {
    return request<any>(`/api/user/roles/${id}/`, { requireAuth: true });
  },
  async updateGroup(id: number, payload: any) {
    return request<any>(`/api/user/roles/${id}/`, { method: 'PUT', body: JSON.stringify(payload), requireAuth: true });
  },
  async deleteGroup(id: number) {
    return request<any>(`/api/user/roles/${id}/`, { method: 'DELETE', requireAuth: true });
  },
  async listMembers(groupId: number) {
    // Backend doesn't expose a direct role->members endpoint; fetch users and filter by role membership
    const users = await request<any>('/api/user/users/', { requireAuth: true });
    const list = Array.isArray(users) ? users : (users.results ?? users);
    return list.filter((u: any) => Array.isArray(u.groups) && u.groups.some((g: any) => Number(g.id ?? g.pk) === Number(groupId)));
  },
  async addMember(groupId: number, userId: number) {
    // Use UserViewSet.assign_roles to add this role to the user's role set
    // Fetch user's current roles
    const user = await request<any>(`/api/user/users/${userId}/`, { requireAuth: true });
    const current = Array.isArray(user.groups) ? user.groups.map((g: any) => Number(g.id ?? g.pk)) : [];
    if (!current.includes(Number(groupId))) current.push(Number(groupId));
    return request<any>(`/api/user/users/${userId}/assign_roles/`, { method: 'POST', body: JSON.stringify({ roles: current }), requireAuth: true });
  },
  async removeMember(groupId: number, userId: number) {
    // Remove the role id from the user's roles using assign_roles
    const user = await request<any>(`/api/user/users/${userId}/`, { requireAuth: true });
    const current = Array.isArray(user.groups) ? user.groups.map((g: any) => Number(g.id ?? g.pk)) : [];
    const remaining = current.filter((id) => id !== Number(groupId));
    return request<any>(`/api/user/users/${userId}/assign_roles/`, { method: 'POST', body: JSON.stringify({ roles: remaining }), requireAuth: true });
  },
};

export const dashboardAPI = {
  async getDashboard() {
    return request<any>('/api/user/dashboard/', { requireAuth: true });
  },
  async saveDashboard(config: any) {
    return request<any>('/api/user/dashboard/', { method: 'POST', body: JSON.stringify({ config }), requireAuth: true });
  }
};

// ==================== User API (profile / home) ====================

export const userAPI = {
  async getHome() {
    return request<any>('/api/user/home/', { requireAuth: true });
  },
  async getProfileForm() {
    return request<any>('/api/user/profile-form/', { requireAuth: true });
  },
  async viewProfile(userId?: number) {
    let url = '/api/user/profile/view/';
    if (typeof userId !== 'undefined' && userId !== null) url += `?user_id=${userId}`;
    return request<any>(url, { requireAuth: true });
  },
  async createProfileField(payload: { label: string; id?: string; type?: string; required?: boolean; options?: string[]; placeholder?: string; help_text?: string; order?: number }) {
    // Backend expects field_type (not type) and choices as a comma-separated string
    const body: any = {
      label: payload.label,
      field_type: payload.type ?? 'text',
      required: !!payload.required,
    };
    if (payload.id) body.label = payload.id ? payload.label : payload.label;
    if (payload.placeholder) body.placeholder = payload.placeholder;
    if (payload.help_text) body.help_text = payload.help_text;
    if (typeof payload.order !== 'undefined') body.order = Number(payload.order);
    if (Array.isArray(payload.options) && payload.options.length > 0) body.choices = payload.options.join(',');

    return request<any>('/api/user/profile-fields/', { method: 'POST', body: JSON.stringify(body), requireAuth: true });
  },
  async saveProfile(payload: any) {
    // Support FormData when files are present. Backend expects { data: [{ field, value }] }
    if (typeof FormData !== 'undefined' && payload instanceof FormData) {
      return request<any>('/api/user/profile/save/', { method: 'POST', body: payload, requireAuth: true });
    }

    let body: any = payload;
    if (payload && typeof payload === 'object' && payload.values) {
      const values = payload.values as Record<string, any>;
      body = { data: Object.keys(values).map((k) => ({ field: Number(k), value: values[k] })) };
    }
    return request<any>('/api/user/profile/save/', { method: 'POST', body: JSON.stringify(body), requireAuth: true });
  },
};

export const usersAPI = {
  async listUsers() {
    return request<any>('/api/users/', { requireAuth: true });
  },
  async setRole(userId: number, role: string) {
    return request<any>(`/api/users/${userId}/role/`, { method: 'POST', body: JSON.stringify({ role }), requireAuth: true });
  }
};

// ==================== Groups & Dashboard API (already defined above) ====================
// groupsAPI and dashboardAPI are defined earlier in this file

// ==================== Typed API Client Export ====================
export interface ApiClient {
  auth: typeof authAPI;
  forms: typeof formsAPI;
  submissions: typeof submissionsAPI;
  groups: typeof groupsAPI;
  dashboard: typeof dashboardAPI;
  user: typeof userAPI;
  users: typeof usersAPI;
}

const apiClient: ApiClient = {
  auth: authAPI,
  forms: formsAPI,
  submissions: submissionsAPI,
  groups: groupsAPI,
  dashboard: dashboardAPI,
  user: userAPI,
  users: usersAPI,
};

export default apiClient;
