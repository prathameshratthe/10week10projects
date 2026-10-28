import {
  DashboardStats,
  PurchaseRecord,
  PurchaseRecordCreatePayload,
  ReceiptExtractionResult,
} from '../types';

const API_BASE = '/api/v1';

export class ApiService {
  static async extractReceipt(file: File): Promise<ReceiptExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/receipts/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to extract receipt' }));
      throw new Error(err.detail || 'Extraction failed');
    }

    return response.json();
  }

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
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
  }

  static async createRecord(data: PurchaseRecordCreatePayload): Promise<PurchaseRecord> {
    const res = await fetch(`${API_BASE}/records/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    });

    if (!res.ok) throw new Error('Failed to delete record');
  }

  static async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats/`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }

  static getExportCsvUrl(): string {
    return `${API_BASE}/records/export/csv`;
  }

  static getExportJsonUrl(): string {
    return `${API_BASE}/records/export/json`;
  }
}
