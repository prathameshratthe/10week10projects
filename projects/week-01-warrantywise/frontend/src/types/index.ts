export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_WARRANTY';
export type ReturnStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_RETURN';

export interface LineItem {
  name: string;
  quantity: number;
  unit_price?: number | null;
  total_price?: number | null;
  category?: string;
}

export interface ReceiptExtractionResult {
  merchant_name: string;
  merchant_address?: string | null;
  purchase_date?: string | null;
  total_amount?: number | null;
  tax_amount?: number | null;
  currency: string;
  invoice_number?: string | null;
  payment_method?: string | null;
  items: LineItem[];
  has_explicit_warranty: boolean;
  warranty_duration_months?: number | null;
  warranty_end_date?: string | null;
  warranty_notes?: string | null;
  has_explicit_return_policy: boolean;
  return_window_days?: number | null;
  return_deadline?: string | null;
  return_notes?: string | null;
  confidence_score: number;
  extraction_method: string;
  raw_text?: string | null;
}

export interface PurchaseRecord {
  id: number;
  merchant_name: string;
  merchant_address?: string | null;
  purchase_date: string;
  total_amount: number;
  tax_amount?: number | null;
  currency: string;
  category: string;
  invoice_number?: string | null;
  payment_method?: string | null;
  items: LineItem[];
  has_explicit_warranty: boolean;
  warranty_duration_months?: number | null;
  warranty_end_date?: string | null;
  warranty_notes?: string | null;
  warranty_status: WarrantyStatus;
  days_left_warranty?: number | null;
  has_explicit_return_policy: boolean;
  return_window_days?: number | null;
  return_deadline?: string | null;
  return_notes?: string | null;
  return_status: ReturnStatus;
  days_left_return?: number | null;
  receipt_filename?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRecordCreatePayload {
  merchant_name: string;
  merchant_address?: string | null;
  purchase_date: string;
  total_amount: number;
  tax_amount?: number | null;
  currency: string;
  category: string;
  invoice_number?: string | null;
  payment_method?: string | null;
  items: LineItem[];
  has_explicit_warranty: boolean;
  warranty_duration_months?: number | null;
  warranty_end_date?: string | null;
  warranty_notes?: string | null;
  has_explicit_return_policy: boolean;
  return_window_days?: number | null;
  return_deadline?: string | null;
  return_notes?: string | null;
  receipt_filename?: string | null;
  notes?: string | null;
}

export interface DashboardStats {
  total_records: number;
  active_warranties: number;
  expiring_soon_warranties: number;
  expired_warranties: number;
  active_returns: number;
  expiring_soon_returns: number;
  expired_returns: number;
  total_spend_by_currency: Record<string, number>;
}
