import re
from typing import List, Set
from app.models.schemas import (
    ChangeType,
    DiffAnalysisRequest,
    DiffAnalysisResponse,
    ImpactedSymbol,
    RiskLevel,
)


class DiffGuardAnalyzer:
    TEST_MAPPING = {
        "auth": ["tests/test_auth.py", "tests/test_jwt_session.py"],
        "user": ["tests/test_users.py", "tests/test_auth.py"],
        "receipt": ["tests/test_receipts.py", "tests/test_extraction.py"],
        "billing": ["tests/test_billing.py", "tests/test_invoices.py"],
        "report": ["tests/test_reports.py", "tests/test_civic_api.py"],
        "vendor": ["tests/test_vendors.py", "tests/test_dossiers.py"],
        "schema": ["tests/test_schemas_validation.py"],
        "model": ["tests/test_database_migrations.py"],
    }

    @classmethod
    def analyze_diff(cls, req: DiffAnalysisRequest) -> DiffAnalysisResponse:
        diff = req.git_diff
        lines = diff.splitlines()

        added_lines = sum(1 for l in lines if l.startswith("+") and not l.startswith("+++"))
        deleted_lines = sum(1 for l in lines if l.startswith("-") and not l.startswith("---"))

        diff_lower = diff.lower()
        title_lower = req.pr_title.lower()

        touched_symbols: List[ImpactedSymbol] = []
        risk_reasons: List[str] = []
        breaking = False

        # Extract file names from diff
        files_found = set(req.changed_files or [])
        for line in lines:
            if line.startswith("diff --git"):
                parts = line.split()
                if len(parts) >= 4:
                    f = parts[3].replace("b/", "")
                    files_found.add(f)
            elif line.startswith("+++ b/"):
                files_found.add(line.replace("+++ b/", "").strip())

        # Check pure documentation
        is_pure_docs = all(f.endswith(".md") or f.endswith(".txt") or "docs/" in f for f in files_found) if files_found else ("readme" in title_lower or "docs" in title_lower)

        # 1. Determine Change Type & Risk Level
        if is_pure_docs:
            change_type = ChangeType.DOCUMENTATION_CHANGE
            risk_level = RiskLevel.LOW
            summary = "Documentation or markdown change. Zero runtime regression blast radius."
            recommended_tests = []
        elif any("migration" in f or "alembic" in f for f in files_found) or re.search(r"\b(drop\s+column|rename_column|drop_table)\b", diff_lower):
            change_type = ChangeType.DATABASE_MIGRATION
            risk_level = RiskLevel.CRITICAL
            breaking = True
            risk_reasons.append("Irreversible database schema alteration or dropped column detected.")
            summary = "High-risk relational database schema migration with potential data loss."
            recommended_tests = ["tests/test_database_migrations.py", "tests/test_models.py"]
        elif any("schema" in f or "models" in f for f in files_found) or re.search(r"class\s+\w+\(BaseModel\):", diff):
            change_type = ChangeType.CORE_SCHEMA_CHANGE
            if deleted_lines > 5 or re.search(r"-\s+\w+\s*:\s*", diff):
                risk_level = RiskLevel.HIGH
                breaking = True
                risk_reasons.append("Field removed or type altered in shared Pydantic data schema.")
                summary = "Core schema modification impacts multiple downstream consumers."
            else:
                risk_level = RiskLevel.MEDIUM
                summary = "Additive schema change with backward compatibility."
            recommended_tests = ["tests/test_schemas_validation.py", "tests/test_api_contracts.py"]
        elif any("api/" in f or "router" in f or "routes" in f for f in files_found) or re.search(r"@(?:app|router)\.(?:get|post|put|delete)", diff):
            change_type = ChangeType.API_ENDPOINT_CHANGE
            has_deleted_route = bool(re.search(r"-\s*@(?:app|router)\.(?:get|post|put|delete)", diff))
            has_added_route = bool(re.search(r"\+\s*@(?:app|router)\.(?:get|post|put|delete)", diff))
            if has_deleted_route and not has_added_route:
                risk_level = RiskLevel.CRITICAL
                breaking = True
                risk_reasons.append("Public API endpoint route deleted.")
                summary = "Breaking API endpoint route removal."
            else:
                risk_level = RiskLevel.MEDIUM
                summary = "API handler updated with new business logic."
            recommended_tests = ["tests/test_api_contracts.py", "tests/test_endpoints.py"]
        elif all("test_" in f or "/tests/" in f for f in files_found) if files_found else "test" in title_lower:
            change_type = ChangeType.TEST_ONLY_CHANGE
            risk_level = RiskLevel.LOW
            summary = "Test suite modifications only. Production runtime logic unaffected."
            recommended_tests = list(files_found)
        else:
            change_type = ChangeType.INTERNAL_LOGIC_CHANGE
            risk_level = RiskLevel.MEDIUM
            summary = "Internal service logic modified."
            recommended_tests = ["tests/test_services.py", "tests/test_core.py"]

        # 2. Extract Touched Symbols
        for line in lines:
            if line.startswith("+") and not line.startswith("+++"):
                func_match = re.search(r"def\s+([a-zA-Z0-9_]+)\s*\(", line)
                if func_match:
                    touched_symbols.append(ImpactedSymbol(
                        name=func_match.group(1),
                        symbol_type="function",
                        file_path="src/service.py",
                        downstream_callers=["api_router", "background_worker"]
                    ))
                class_match = re.search(r"class\s+([a-zA-Z0-9_]+)", line)
                if class_match:
                    touched_symbols.append(ImpactedSymbol(
                        name=class_match.group(1),
                        symbol_type="class",
                        file_path="src/models.py",
                        downstream_callers=["data_pipeline", "view_controller"]
                    ))

        # 3. Dynamic Test Set Aggregation
        test_candidates: Set[str] = set(recommended_tests)
        for key, tests in cls.TEST_MAPPING.items():
            if key in diff_lower or key in title_lower:
                test_candidates.update(tests[:2])

        final_tests = sorted(list(test_candidates))
        if is_pure_docs:
            final_tests = []

        total_suite = 24
        rec_count = len(final_tests)
        ci_saved = round(((total_suite - rec_count) / total_suite) * 100.0, 1)

        return DiffAnalysisResponse(
            pr_title=req.pr_title,
            risk_level=risk_level,
            primary_change_type=change_type,
            breaking_change_detected=breaking,
            lines_added=added_lines,
            lines_deleted=deleted_lines,
            touched_symbols=touched_symbols[:5],
            recommended_test_files=final_tests,
            full_suite_test_count=total_suite,
            recommended_test_count=rec_count,
            ci_time_saved_pct=max(0.0, ci_saved),
            executive_summary=summary,
            risk_reasons=risk_reasons
        )
