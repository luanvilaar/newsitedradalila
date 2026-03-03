#!/usr/bin/env python3
"""
Extract bioimpedance data from PDF using pdfplumber

Usage:
    python extract_bioimpedance_pdf.py <pdf_path> [--output json|dict]

Extracts common bioimpedance measurements:
- Weight (kg)
- Height (cm)
- Body Fat (%)
- Muscle Mass (kg)
- Bone Mass (kg)
- Visceral Fat
- Water (%)
- BMR (Basal Metabolic Rate)
- Metabolic Age
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, Optional, Any

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)


class BioimpedanceExtractor:
    """Extract bioimpedance data from PDF reports"""

    # Common field patterns (Portuguese and English)
    PATTERNS = {
        "weight": [
            r"peso\s*[:\-]?\s*([\d.]+)\s*kg",
            r"weight\s*[:\-]?\s*([\d.]+)",
            r"kg\s*([\d.]+)",
        ],
        "height": [
            r"altura\s*[:\-]?\s*([\d.]+)\s*cm",
            r"height\s*[:\-]?\s*([\d.]+)",
            r"cm\s*([\d.]+)",
        ],
        "body_fat_percentage": [
            r"gordura\s*(?:corporal)?\s*[:\-]?\s*([\d.]+)\s*%",
            r"body\s*fat\s*[:\-]?\s*([\d.]+)",
            r"fat\s*[:\-]?\s*([\d.]+)\s*%",
        ],
        "muscle_mass": [
            r"massa\s*(?:muscular|múscular)\s*[:\-]?\s*([\d.]+)\s*kg",
            r"muscle\s*mass\s*[:\-]?\s*([\d.]+)",
        ],
        "bone_mass": [
            r"massa\s*(?:óssea|ossea)\s*[:\-]?\s*([\d.]+)\s*kg",
            r"bone\s*mass\s*[:\-]?\s*([\d.]+)",
        ],
        "visceral_fat": [
            r"gordura\s*visceral\s*[:\-]?\s*([\d.]+)",
            r"visceral\s*[:\-]?\s*([\d.]+)",
        ],
        "water_percentage": [
            r"água\s*(?:corporal)?\s*[:\-]?\s*([\d.]+)\s*%",
            r"water\s*[:\-]?\s*([\d.]+)\s*%",
        ],
        "basal_metabolic_rate": [
            r"(?:tmb|bmr|metabolismo\s*basal)\s*[:\-]?\s*([\d.]+)",
            r"basal\s*metabol\w*\s*[:\-]?\s*([\d.]+)",
        ],
        "metabolic_age": [
            r"idade\s*(?:metabólica|metabolica)\s*[:\-]?\s*([\d.]+)",
            r"metabolic\s*age\s*[:\-]?\s*([\d.]+)",
        ],
    }

    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

    def extract(self) -> Dict[str, Optional[Any]]:
        """Extract all bioimpedance data from PDF"""
        data = {
            "weight": None,
            "height": None,
            "body_fat_percentage": None,
            "muscle_mass": None,
            "bone_mass": None,
            "visceral_fat": None,
            "water_percentage": None,
            "basal_metabolic_rate": None,
            "metabolic_age": None,
            "measurement_date": None,
            "extracted_text": "",
            "notes": "",
        }

        try:
            with pdfplumber.open(str(self.pdf_path)) as pdf:
                # Extract text from all pages
                full_text = ""
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text
                    page_text = page.extract_text() or ""
                    full_text += f"\n--- Page {page_num} ---\n{page_text}\n"

                    # Try to extract tables (useful for structured data)
                    tables = page.extract_tables()
                    if tables:
                        for table_idx, table in enumerate(tables):
                            data["notes"] += f"\nTable {table_idx + 1} found on page {page_num}"

                data["extracted_text"] = full_text

                # Extract structured data from text
                self._extract_from_text(full_text, data)

        except Exception as e:
            data["notes"] = f"Erro ao processar PDF: {str(e)}"

        return data

    def _extract_from_text(self, text: str, data: Dict) -> None:
        """Extract structured data from text using patterns"""
        text_lower = text.lower()

        for field, patterns in self.PATTERNS.items():
            for pattern in patterns:
                matches = re.findall(pattern, text_lower, re.IGNORECASE)
                if matches:
                    try:
                        # Get first match and convert to float
                        value = float(matches[0])
                        data[field] = value
                        break
                    except (ValueError, IndexError):
                        continue

    def to_json(self) -> str:
        """Return extracted data as JSON"""
        data = self.extract()
        # Remove extracted_text from JSON output (too verbose)
        data.pop("extracted_text", None)
        return json.dumps(data, indent=2, ensure_ascii=False)


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_bioimpedance_pdf.py <pdf_path> [--output json|dict]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_format = sys.argv[2].replace("--output", "").strip() if len(sys.argv) > 2 else "json"

    try:
        extractor = BioimpedanceExtractor(pdf_path)

        if output_format == "dict":
            print(extractor.extract())
        else:  # json (default)
            print(extractor.to_json())

    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to extract data: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
