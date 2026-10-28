import re
from typing import List, Set
from app.models.schemas import (
    BankTransaction,
    InvoiceRecord,
    MatchStatus,
    MatchedPair,
    ReconciliationRequest,
    ReconciliationSummary,
)


class BillMatchEngine:
    @classmethod
    def reconcile(cls, req: ReconciliationRequest) -> ReconciliationSummary:
        invoices = req.invoices
        transactions = req.transactions

        matched_pairs: List[MatchedPair] = []
        matched_inv_nos: Set[str] = set()
        matched_txn_ids: Set[str] = set()

        # Helper function for vendor token overlap
        def vendor_token_overlap(vendor: str, narration: str) -> float:
            v_clean = re.sub(r"\b(pvt|ltd|llp|solutions|infotech|services|traders|works|corporation)\b", "", vendor.lower())
            v_tokens = [t for t in re.findall(r"[a-z0-9]+", v_clean) if len(t) > 2]
            if not v_tokens:
                return 0.0
            narr_lower = narration.lower()
            matches = sum(1 for t in v_tokens if t in narr_lower or t[:4] in narr_lower)
            return matches / len(v_tokens)

        # --- Tier 1: Exact Net Settlement Match (Invoice No / UTR in Narration + Exact Amount) ---
        for inv in invoices:
            if inv.invoice_no in matched_inv_nos:
                continue

            inv_clean_id = re.sub(r"[^a-zA-Z0-9]", "", inv.invoice_no).lower()

            for txn in transactions:
                if txn.txn_id in matched_txn_ids:
                    continue

                txn_clean_narr = re.sub(r"[^a-zA-Z0-9]", "", txn.narration).lower()
                amount_diff_net = abs(txn.debit_amount - inv.expected_net_payable)
                amount_diff_gross = abs(txn.debit_amount - inv.gross_amount)

                # Check if invoice no is embedded in narration
                has_inv_ref = (inv_clean_id in txn_clean_narr) or (inv.invoice_no.split("-")[-1] in txn.narration)

                if has_inv_ref:
                    if amount_diff_net < 0.05:
                        tds_amt = round(inv.gross_amount - inv.expected_net_payable, 2)
                        status = MatchStatus.MATCHED_TDS if tds_amt > 0 else MatchStatus.MATCHED_EXACT
                        matched_pairs.append(MatchedPair(
                            invoice_no=inv.invoice_no,
                            txn_id=txn.txn_id,
                            vendor_name=inv.vendor_name,
                            match_status=status,
                            invoice_amount=inv.gross_amount,
                            bank_debit=txn.debit_amount,
                            tds_deducted=tds_amt,
                            variance=0.0,
                            reasoning=f"Exact Reference & Amount Match: Invoice #{inv.invoice_no} matched against UTR/Narration with {inv.tds_rate_pct}% TDS deduction."
                        ))
                        matched_inv_nos.add(inv.invoice_no)
                        matched_txn_ids.add(txn.txn_id)
                        break
                    elif amount_diff_gross < 0.05:
                        matched_pairs.append(MatchedPair(
                            invoice_no=inv.invoice_no,
                            txn_id=txn.txn_id,
                            vendor_name=inv.vendor_name,
                            match_status=MatchStatus.MATCHED_EXACT,
                            invoice_amount=inv.gross_amount,
                            bank_debit=txn.debit_amount,
                            tds_deducted=0.0,
                            variance=0.0,
                            reasoning=f"Exact Gross Settlement: Full invoice #{inv.invoice_no} value settled with zero TDS deduction."
                        ))
                        matched_inv_nos.add(inv.invoice_no)
                        matched_txn_ids.add(txn.txn_id)
                        break

        # --- Tier 2: Truncated Vendor Narration + Amount Match (Within ±₹2 roundoff) ---
        for inv in invoices:
            if inv.invoice_no in matched_inv_nos:
                continue

            for txn in transactions:
                if txn.txn_id in matched_txn_ids:
                    continue

                overlap = vendor_token_overlap(inv.vendor_name, txn.narration)
                amount_diff_net = abs(txn.debit_amount - inv.expected_net_payable)
                amount_diff_gross = abs(txn.debit_amount - inv.gross_amount)

                if overlap >= 0.5:
                    if amount_diff_net <= 2.0:
                        tds_amt = round(inv.gross_amount - txn.debit_amount, 2)
                        matched_pairs.append(MatchedPair(
                            invoice_no=inv.invoice_no,
                            txn_id=txn.txn_id,
                            vendor_name=inv.vendor_name,
                            match_status=MatchStatus.MATCHED_FUZZY,
                            invoice_amount=inv.gross_amount,
                            bank_debit=txn.debit_amount,
                            tds_deducted=tds_amt,
                            variance=round(amount_diff_net, 2),
                            reasoning=f"Fuzzy Narration Match: Truncated vendor name matched '{inv.vendor_name}' with {inv.tds_rate_pct}% TDS and ±₹{amount_diff_net:.2f} round-off."
                        ))
                        matched_inv_nos.add(inv.invoice_no)
                        matched_txn_ids.add(txn.txn_id)
                        break
                    elif amount_diff_gross <= 2.0:
                        matched_pairs.append(MatchedPair(
                            invoice_no=inv.invoice_no,
                            txn_id=txn.txn_id,
                            vendor_name=inv.vendor_name,
                            match_status=MatchStatus.MATCHED_FUZZY,
                            invoice_amount=inv.gross_amount,
                            bank_debit=txn.debit_amount,
                            tds_deducted=0.0,
                            variance=round(amount_diff_gross, 2),
                            reasoning=f"Fuzzy Narration Match: Truncated vendor name matched gross invoice amount with ±₹{amount_diff_gross:.2f} variance."
                        ))
                        matched_inv_nos.add(inv.invoice_no)
                        matched_txn_ids.add(txn.txn_id)
                        break

        # --- Tier 3: Mark Unmatched Invoices ---
        for inv in invoices:
            if inv.invoice_no not in matched_inv_nos:
                matched_pairs.append(MatchedPair(
                    invoice_no=inv.invoice_no,
                    txn_id=None,
                    vendor_name=inv.vendor_name,
                    match_status=MatchStatus.UNMATCHED_INVOICE,
                    invoice_amount=inv.gross_amount,
                    bank_debit=0.0,
                    tds_deducted=0.0,
                    variance=inv.gross_amount,
                    reasoning=f"Unpaid Invoice: No matching bank debit found for #{inv.invoice_no} ({inv.vendor_name})."
                ))

        # --- Tier 4: Mark Unmatched Bank Transactions (Phantom Debits / Non-Vendor payments) ---
        for txn in transactions:
            if txn.txn_id not in matched_txn_ids:
                matched_pairs.append(MatchedPair(
                    invoice_no=None,
                    txn_id=txn.txn_id,
                    vendor_name="Unidentified Beneficiary",
                    match_status=MatchStatus.UNMATCHED_BANK_TXN,
                    invoice_amount=0.0,
                    bank_debit=txn.debit_amount,
                    tds_deducted=0.0,
                    variance=txn.debit_amount,
                    reasoning=f"Unreconciled Bank Debit: Transaction '{txn.narration}' has no matching approved purchase invoice."
                ))

        matched_count = len(matched_inv_nos)
        total_inv = len(invoices)
        total_settled = sum(m.bank_debit for m in matched_pairs if m.match_status in (MatchStatus.MATCHED_EXACT, MatchStatus.MATCHED_TDS, MatchStatus.MATCHED_FUZZY))
        total_tds = sum(m.tds_deducted for m in matched_pairs if m.match_status in (MatchStatus.MATCHED_EXACT, MatchStatus.MATCHED_TDS, MatchStatus.MATCHED_FUZZY))
        rec_rate = round((matched_count / max(total_inv, 1)) * 100.0, 1)

        return ReconciliationSummary(
            total_invoices=total_inv,
            total_bank_txns=len(transactions),
            matched_count=matched_count,
            unmatched_invoices_count=total_inv - matched_count,
            unmatched_txns_count=len(transactions) - len(matched_txn_ids),
            total_invoice_value_inr=sum(i.gross_amount for i in invoices),
            total_settled_value_inr=total_settled,
            tds_withheld_total_inr=total_tds,
            reconciliation_rate_pct=rec_rate,
            matches=matched_pairs
        )
