# -*- coding: utf-8 -*-
"""
Parses Incoterm .md files of the form:

    # <number>. <CODE> — <Name>

    ```yaml
    incoterm:
      code: ...
      ...
    ```

    ## Section heading
    prose...

into JSONL records where the YAML block becomes structured *metadata*
(never embedded) and the prose becomes a single embeddable *text* field
(plus a per-section breakdown, kept available but not required).

Also cross-validates the parsed metadata against comparison.yaml and
transport_compatibility.yaml so drift between the three sources is caught
automatically instead of silently shipping.

Usage:
    python3 parse_incoterms.py <folder_of_md_files> <comparison.yaml> <transport_compatibility.yaml> <out.jsonl>
"""
import sys, os, re, json, glob
import yaml

YAML_BLOCK_RE = re.compile(r"```yaml\s*\n(.*?)\n```", re.DOTALL)
TITLE_RE = re.compile(r"^#\s*(\d+)\.\s*([A-Z]{3})\s*[—-]\s*(.+)$", re.MULTILINE)
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def slugify(header):
    return re.sub(r"[^a-z0-9]+", "_", header.strip().lower()).strip("_")


def parse_one_md(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()

    yaml_match = YAML_BLOCK_RE.search(raw)
    if not yaml_match:
        # Skip files without YAML blocks (e.g., overview.md)
        return None, [f"skipped: no ```yaml block found"]
    yaml_text = yaml_match.group(1)
    parsed_yaml = yaml.safe_load(yaml_text)
    if not parsed_yaml or "incoterm" not in parsed_yaml:
        raise ValueError(f"{path}: yaml block missing top-level 'incoterm' key")
    meta = parsed_yaml["incoterm"]

    title_match = TITLE_RE.search(raw)
    rule_number = int(title_match.group(1)) if title_match else None
    title_code = title_match.group(2) if title_match else None

    # cross-check title code vs yaml code (catches copy-paste mismatches)
    warnings = []
    if title_code and title_code != meta.get("code"):
        warnings.append(f"title code '{title_code}' != yaml code '{meta.get('code')}'")

    # body = everything after the yaml fenced block
    body = raw[yaml_match.end():]

    # split body into sections by '## ' headers
    sections = {}
    headers = list(SECTION_RE.finditer(body))
    for i, h in enumerate(headers):
        start = h.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(body)
        section_title = h.group(1).strip()
        section_text = body[start:end].strip()
        sections[slugify(section_title)] = section_text

    # embeddable text: full prose body, YAML/title already stripped, whitespace normalised
    text = body.strip()
    # Remove trailing markdown horizontal rules (noise for embedding)
    text = re.sub(r"\n\n---\s*$", "", text)
    # Normalise excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)

    code = meta.get("code")
    record = {
        "id": f"INCOTERM-{code}",
        "code": code,
        "name": meta.get("name"),
        "rule_number": rule_number,
        "version": meta.get("version"),
        "category": meta.get("category"),
        "mode_scope": meta.get("mode_scope"),
        "transport_modes": meta.get("transport_modes"),
        "related_rules": meta.get("related_rules"),
        "metadata": meta,          # full nested YAML block, verbatim -- not embedded
        "sections": sections,      # optional granular chunking, not embedded by default
        "text": text,              # <-- this is the ONLY field that should go to the embedder
        "source": "incoterms_2020",
        "source_file": os.path.basename(path),
        "last_updated": "2026-08-28",
    }
    return record, warnings


def cross_validate(records, comparison, compat):
    """Check the per-rule .md metadata against the two lookup tables."""
    findings = []
    comp_table = comparison.get("incoterms_comparison", {})

    # 1. every code in the .md set exists in comparison.yaml, and category/mode_scope agree
    for rec in records:
        code = rec["code"]
        comp_entry = comp_table.get(code)
        if comp_entry is None:
            findings.append(f"{code}: not found in comparison.yaml")
            continue
        if rec["category"] != comp_entry.get("category"):
            findings.append(f"{code}: category mismatch (.md={rec['category']!r} vs comparison.yaml={comp_entry.get('category')!r})")
        if rec["mode_scope"] != comp_entry.get("mode_scope"):
            findings.append(f"{code}: mode_scope mismatch (.md={rec['mode_scope']!r} vs comparison.yaml={comp_entry.get('mode_scope')!r})")

    # 2. road-compatibility consistency: comparison.yaml's mode_scope vs transport_compatibility.yaml's road lists
    road_compatible_set = set(compat["transport_compatibility"]["road"]["compatible"])
    road_incompatible_set = set(compat["transport_compatibility"]["road"]["not_intended_for"])
    for code, entry in comp_table.items():
        scope = entry.get("mode_scope")
        in_compat = code in road_compatible_set
        in_incompat = code in road_incompatible_set
        if not in_compat and not in_incompat:
            findings.append(f"{code}: missing from BOTH road.compatible and road.not_intended_for in transport_compatibility.yaml")
        if in_compat and in_incompat:
            findings.append(f"{code}: listed in BOTH road.compatible and road.not_intended_for (contradiction)")
        if scope == "any_mode" and not in_compat:
            findings.append(f"{code}: mode_scope=any_mode in comparison.yaml but NOT marked road-compatible in transport_compatibility.yaml")
        if scope == "sea_and_inland_waterway_only" and not in_incompat:
            findings.append(f"{code}: mode_scope=sea_and_inland_waterway_only in comparison.yaml but NOT excluded from road in transport_compatibility.yaml")

    # 3. every transport mode's lists only reference codes that exist in comparison.yaml
    for mode, spec in compat["transport_compatibility"].items():
        for bucket in ("compatible", "not_intended_for"):
            for code in spec.get(bucket, []):
                if code not in comp_table:
                    findings.append(f"transport_compatibility.yaml[{mode}][{bucket}] references unknown code '{code}'")

    return findings


def compute_road_compatible(code, compat):
    road = compat["transport_compatibility"]["road"]
    if code in road["compatible"]:
        return True
    if code in road["not_intended_for"]:
        return False
    return None  # unknown -- should have been caught by cross_validate


def main():
    if len(sys.argv) != 5:
        print(__doc__)
        sys.exit(1)
    md_dir, comparison_path, compat_path, out_path = sys.argv[1:5]

    with open(comparison_path, encoding="utf-8") as f:
        comparison = yaml.safe_load(f)
    with open(compat_path, encoding="utf-8") as f:
        compat = yaml.safe_load(f)

    records = []
    all_warnings = []
    for path in sorted(glob.glob(os.path.join(md_dir, "*.md"))):
        result = parse_one_md(path)
        if result is None or result[0] is None:
            # Skip files without YAML
            if result and result[1]:
                all_warnings.extend([f"{os.path.basename(path)}: {w}" for w in result[1]])
            continue
        rec, warnings = result
        rec["road_compatible"] = compute_road_compatible(rec["code"], compat)
        records.append(rec)
        for w in warnings:
            all_warnings.append(f"{os.path.basename(path)}: {w}")

    findings = cross_validate(records, comparison, compat)

    with open(out_path, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"Parsed {len(records)} incoterm file(s) -> {out_path}")
    print(f"\nParse warnings ({len(all_warnings)}):")
    for w in all_warnings:
        print(" -", w)
    print(f"\nCross-validation findings ({len(findings)}):")
    for f_ in findings:
        print(" -", f_)


if __name__ == "__main__":
    main()