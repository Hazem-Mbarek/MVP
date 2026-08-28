# -*- coding: utf-8 -*-
"""
Parses CMR Convention article .txt files into granular JSONL sub-records.

Each file is named article_NN.txt and contains:
  - Title: "CMR Convention — Article N"
  - Body: Article text with numbered paragraphs and lettered items

Generates sub-records for each numbered paragraph and lettered item:
  - CMR-N: full article
  - CMR-N-1, CMR-N-2, etc: numbered paragraphs
  - CMR-N-4a, CMR-N-4b, etc: lettered items within paragraphs

Usage:
    python3 parse_cmr.py <articles_folder> <out.jsonl>
"""
import sys, os, re, json, glob


def extract_subsections(body_text):
    """
    Extract numbered paragraphs and lettered items from body text.
    Returns list of (id_suffix, text) tuples.
    """
    subsections = []
    
    # Split by numbered paragraphs: "1. ", "2. ", etc.
    # Pattern: digit(s) followed by period and space (with optional leading whitespace)
    paragraph_pattern = r"^\s*(\d+)\.\s+"
    
    lines = body_text.split("\n")
    current_para_num = None
    current_para_lines = []
    
    for line in lines:
        para_match = re.match(paragraph_pattern, line)
        
        if para_match:
            # Save previous paragraph if any
            if current_para_num is not None and current_para_lines:
                para_text = "\n".join(current_para_lines).strip()
                if para_text:
                    subsections.append((str(current_para_num), para_text))
                    # Extract lettered items from this paragraph
                    extract_lettered_items(para_text, current_para_num, subsections)
            
            # Start new paragraph
            current_para_num = int(para_match.group(1))
            # Remove the number and period from line
            line_text = re.sub(paragraph_pattern, "", line, count=1).strip()
            current_para_lines = [line_text] if line_text else []
        else:
            # Continuation of current paragraph
            if current_para_num is not None:
                current_para_lines.append(line)
    
    # Don't forget the last paragraph
    if current_para_num is not None and current_para_lines:
        para_text = "\n".join(current_para_lines).strip()
        if para_text:
            subsections.append((str(current_para_num), para_text))
            extract_lettered_items(para_text, current_para_num, subsections)
    
    return subsections


def extract_lettered_items(text, para_num, subsections):
    """Extract lettered items (a, b, c, etc.) from paragraph text."""
    # Pattern: "(a)", "(b)", etc. with optional leading whitespace
    item_pattern = r"^\s*\(([a-z])\)\s+"
    
    lines = text.split("\n")
    for line in lines:
        item_match = re.match(item_pattern, line)
        if item_match:
            letter = item_match.group(1)
            # Remove the (letter) prefix
            item_text = re.sub(item_pattern, "", line, count=1).strip()
            if item_text:
                subsections.append((f"{para_num}{letter}", item_text))


def parse_one_article(path):
    """Parse a single CMR article .txt file into sub-records."""
    with open(path, encoding="utf-8") as f:
        raw = f.read().strip()
    
    if not raw:
        return [], ["empty file"]
    
    # Extract article number from filename (article_NN.txt)
    basename = os.path.basename(path)
    match = re.match(r"article_(\d+)\.txt", basename)
    if not match:
        return [], ["filename does not match article_NN.txt pattern"]
    
    article_num = int(match.group(1))
    
    # Parse title and body
    lines = raw.split("\n")
    title_line = lines[0] if lines else ""
    
    # Extract article number from title (validate)
    title_match = re.search(r"Article\s+(\d+)", title_line)
    if title_match:
        title_num = int(title_match.group(1))
        if title_num != article_num:
            return [], [f"article number mismatch: filename={article_num}, title={title_num}"]
    
    # Body is everything after the title, skip "Article" line
    body_lines = lines[1:]  # Skip title
    
    # Find where actual content starts (after "Article" line)
    content_start = 0
    for i, line in enumerate(body_lines):
        if line.strip() and not line.strip() == "Article":
            content_start = i
            break
    
    body = "\n".join(body_lines[content_start:]).strip()
    
    # Clean body: remove extra whitespace
    body = re.sub(r"\n{3,}", "\n\n", body)
    
    records = []
    
    # Create main article record
    main_record = {
        "id": f"CMR-{article_num}",
        "article_number": article_num,
        "title": title_line,
        "text": body,
        "source": "CMR_Convention",
        "source_file": basename,
        "last_updated": "2026-08-28",
    }
    records.append(main_record)
    
    # Extract and create sub-records for paragraphs and items
    subsections = extract_subsections(body)
    for suffix, text in subsections:
        sub_record = {
            "id": f"CMR-{article_num}-{suffix}",
            "article_number": article_num,
            "subsection": suffix,
            "title": f"{title_line}, paragraph {suffix}",
            "text": text,
            "source": "CMR_Convention",
            "source_file": basename,
            "last_updated": "2026-08-28",
        }
        records.append(sub_record)
    
    return records, []



def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    
    articles_dir, out_path = sys.argv[1:3]
    
    all_records = []
    all_warnings = []
    
    for path in sorted(glob.glob(os.path.join(articles_dir, "article_*.txt"))):
        records, warnings = parse_one_article(path)
        
        if not records:
            if warnings:
                all_warnings.extend([f"{os.path.basename(path)}: {w}" for w in warnings])
            continue
        
        all_records.extend(records)
        for w in warnings:
            all_warnings.append(f"{os.path.basename(path)}: {w}")
    
    # Write all records to JSONL
    with open(out_path, "w", encoding="utf-8") as f:
        for rec in all_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    
    # Count main articles vs sub-records
    main_records = [r for r in all_records if "-" not in r["id"].split("-")[1] if len(r["id"].split("-")) == 2]
    sub_records = [r for r in all_records if len(r["id"].split("-")) > 2]
    
    print(f"Parsed {len(main_records)} CMR articles")
    print(f"Generated {len(sub_records)} sub-records (paragraphs and items)")
    print(f"Total records: {len(all_records)} -> {out_path}")
    
    if all_warnings:
        print(f"\nParse warnings ({len(all_warnings)}):")
        for w in all_warnings:
            print(" -", w)


if __name__ == "__main__":
    main()
