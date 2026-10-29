import {
  AnalyticsSummary,
  ClaimLetterResponse,
  DashboardStats,
  NotificationItem,
  PurchaseRecord,
  PurchaseRecordCreatePayload,
  ReceiptExtractionResult,
  User,
  WarrantyClaim,
  WarrantyClaimCreate,
} from '../types';

const API_BASE = '/api/v1';

export class ApiService {
  // Token management
  static getToken(): string | null {
    return localStorage.getItem('warrantywise_token');
  }

  static setToken(token: string): void {
    localStorage.setItem('warrantywise_token', token);
  }

  static removeToken(): void {
    localStorage.removeItem('warrantywise_token');
    localStorage.removeItem('warrantywise_user');
  }

  static getStoredUser(): User | null {
    const raw = localStorage.getItem('warrantywise_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setStoredUser(user: User): void {
    localStorage.setItem('warrantywise_user', JSON.stringify(user));
  }

  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Auth APIs
  static async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    this.setToken(data.access_token);
    this.setStoredUser(data.user);
    return data;
  }

  static async signup(
    email: string,
    password: string,
    fullName: string,
    organizationName: string
  ): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        organization_name: organizationName,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Signup failed');
    }
    const data = await res.json();
    this.setToken(data.access_token);
    this.setStoredUser(data.user);
    return data;
  }

  static async demoLogin(role: 'admin' | 'consumer'): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    this.setToken(data.access_token);
    this.setStoredUser(data.user);
    return data;
  }

  static async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve user profile');
    const user = await res.json();
    this.setStoredUser(user);
    return user;
  }

  static async generateApiKey(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/generate-key`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate API key');
    const data = await res.json();
    return data.api_key;
  }

  // Receipt Extraction
  static async extractReceipt(file: File): Promise<ReceiptExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/receipts/extract`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to extract receipt' }));
      throw new Error(err.detail || 'Extraction failed');
    }

    return response.json();
  }

  // Records API
  static async listRecords(params?: {
    search?: string;
    category?: string;
    warranty_status?: string;
    return_status?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PurchaseRecord[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'ALL') query.append('category', params.category);
    if (params?.warranty_status && params.warranty_status !== 'ALL')
      query.append('warranty_status', params.warranty_status);
    if (params?.return_status && params.return_status !== 'ALL')
      query.append('return_status', params.return_status);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);

    const url = `${API_BASE}/records/?${query.toString()}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
  }

  static async createRecord(data: PurchaseRecordCreatePayload): Promise<PurchaseRecord> {
    const res = await fetch(`${API_BASE}/records/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create record' }));
      throw new Error(err.detail || 'Failed to create record');
    }

    return res.json();
  }

  static async updateRecord(
    id: number,
    data: Partial<PurchaseRecordCreatePayload>
  ): Promise<PurchaseRecord> {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update record' }));
      throw new Error(err.detail || 'Failed to update record');
    }

    return res.json();
  }

  static async deleteRecord(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete record');
  }

  static async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats/`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }

  // Claims API
  static async listClaims(status?: string): Promise<WarrantyClaim[]> {
    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status', status);
    const res = await fetch(`${API_BASE}/claims/?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
  }

  static async createClaim(data: WarrantyClaimCreate): Promise<WarrantyClaim> {
    const res = await fetch(`${API_BASE}/claims/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create claim' }));
      throw new Error(err.detail || 'Failed to create claim');
    }
    return res.json();
  }

  static async updateClaim(id: number, data: Partial<WarrantyClaim>): Promise<WarrantyClaim> {
    const res = await fetch(`${API_BASE}/claims/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update claim');
    return res.json();
  }

  static async deleteClaim(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/claims/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete claim');
  }

  static async generateClaimLetter(data: {
    record_id: number;
    issue_description: string;
    desired_resolution: string;
    user_name?: string;
  }): Promise<ClaimLetterResponse> {
    const res = await fetch(`${API_BASE}/claims/generate-letter`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate dispute letter' }));
      throw new Error(err.detail || 'Failed to generate letter');
    }
    return res.json();
  }

  // Notifications API
  static async listNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications/`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  }

  static async markNotificationRead(id: number): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
  }

  static async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }

  static async triggerTestAlert(data: {
    type: string;
    severity: string;
    title: string;
    message: string;
  }): Promise<NotificationItem> {
    const res = await fetch(`${API_BASE}/notifications/test-alert`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to trigger alert');
    return res.json();
  }

  // Workspace & Analytics API
  static async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/workspace/analytics`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  }

  static async resetDemoData(): Promise<void> {
    const res = await fetch(`${API_BASE}/workspace/reset-demo`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset demo vault');
  }

  static getExportCsvUrl(): string {
    return `${API_BASE}/records/export/csv`;
  }

  static getExportJsonUrl(): string {
    return `${API_BASE}/records/export/json`;
  }
}
