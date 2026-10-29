export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_WARRANTY';
export type ReturnStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_RETURN';
export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  email: string;
  full_name: string;
  organization_name: string;
  role: string;
  api_key?: string | null;
  created_at: string;
}

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

export interface WarrantyClaim {
  id: number;
  record_id: number;
  claim_number: string;
  title: string;
  issue_description: string;
  desired_resolution: string;
  status: ClaimStatus;
  filing_date: string;
  claim_letter_body?: string | null;
  tracking_number?: string | null;
  repair_cost_claimed?: number | null;
  created_at: string;
  updated_at: string;
  merchant_name?: string | null;
  product_name?: string | null;
  purchase_date?: string | null;
  warranty_end_date?: string | null;
}

export interface WarrantyClaimCreate {
  record_id: number;
  title: string;
  issue_description: string;
  desired_resolution: string;
  repair_cost_claimed?: number;
  status?: ClaimStatus;
}

export interface ClaimLetterResponse {
  letter_body: string;
  claim_number: string;
  statutory_citations: string[];
  subject: string;
}

export interface NotificationItem {
  id: number;
  type: string;
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  record_id?: number | null;
  read: boolean;
  created_at: string;
}

export interface CategorySpendItem {
  category: string;
  total_amount: number;
  percentage: number;
  item_count: number;
}

export interface ExpirationTimelineItem {
  period: string;
  count: number;
  total_insured_value: number;
}

export interface VendorReliabilityItem {
  vendor: string;
  records_count: number;
  active_warranties: number;
  claims_filed: number;
  reliability_score: number;
}

export interface AnalyticsSummary {
  total_portfolio_value: number;
  capital_at_risk: number;
  total_active_warranties: number;
  total_claims_active: number;
  claims_settlement_rate: number;
  category_distribution: CategorySpendItem[];
  expiration_timeline: ExpirationTimelineItem[];
  vendor_reliability: VendorReliabilityItem[];
}
