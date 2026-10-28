from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class MatchStatus(str, Enum):
    MATCHED_EXACT = "MATCHED_EXACT"
    MATCHED_TDS = "MATCHED_TDS"
    MATCHED_FUZZY = "MATCHED_FUZZY"
    UNMATCHED_INVOICE = "UNMATCHED_INVOICE"
    UNMATCHED_BANK_TXN = "UNMATCHED_BANK_TXN"


class InvoiceRecord(BaseModel):
    invoice_no: str
    vendor_name: str
    invoice_date: str
    gross_amount: float = Field(..., gt=0.0)
    tds_rate_pct: float = Field(default=0.0, ge=0.0, le=30.0)
    expected_net_payable: float = Field(..., gt=0.0)


class BankTransaction(BaseModel):
    txn_id: str
    txn_date: str
    narration: str
    debit_amount: float = Field(..., gt=0.0)
    reference_utr: Optional[str] = None


class MatchedPair(BaseModel):
    invoice_no: Optional[str] = None
    txn_id: Optional[str] = None
    vendor_name: str
    match_status: MatchStatus
    invoice_amount: float
    bank_debit: float
    tds_deducted: float = 0.0
    variance: float = 0.0
    reasoning: str


class ReconciliationRequest(BaseModel):
    invoices: List[InvoiceRecord]
    transactions: List[BankTransaction]


class ReconciliationSummary(BaseModel):
    total_invoices: int
    total_bank_txns: int
    matched_count: int
    unmatched_invoices_count: int
    unmatched_txns_count: int
    total_invoice_value_inr: float
    total_settled_value_inr: float
    tds_withheld_total_inr: float
    reconciliation_rate_pct: float
    matches: List[MatchedPair]
