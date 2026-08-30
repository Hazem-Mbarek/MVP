#!/usr/bin/env python3
"""
Generate semantic embeddings using all-MiniLM-L6-v2
Saves embeddings to JSON for use in Node.js backend
"""

import json
import sys
from pathlib import Path
import csv

# Import sentence-transformers for semantic embeddings
from sentence_transformers import SentenceTransformer

def read_jsonl(filepath):
    """Read JSONL file and return list of records"""
    records = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    records.append(json.loads(line))
    except FileNotFoundError:
        print(f"Warning: Could not read {filepath}")
    return records

def read_csv_as_chunks(filepath):
    """Read CSV file and return list of text chunks"""
    chunks = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert row to text for embedding
                row_text = ", ".join([f"{k}: {v}" for k, v in row.items()])
                chunks.append(row_text)
    except FileNotFoundError:
        print(f"Warning: Could not read {filepath}")
    return chunks

def generate_embeddings():
    """Generate embeddings for all knowledge sources"""
    print("[EMBEDDINGS] Loading all-MiniLM-L6-v2 model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("[EMBEDDINGS] Model loaded successfully")
    
    chunks = []
    
    # Process FAQ
    print("[EMBEDDINGS] Processing FAQ...")
    faq_records = read_jsonl('data/knowledge/faq/faq.jsonl')
    for record in faq_records:
        text = f"Q: {record.get('question', '')}\nA: {record.get('answer', '')}"
        vector = model.encode(text, normalize_embeddings=True).tolist()
        chunks.append({
            'text': text,
            'vector': vector,
            'metadata': {
                'id': record.get('id'),
                'source': 'faq',
                'category': record.get('category'),
            }
        })
    print(f"[EMBEDDINGS] Processed {len(faq_records)} FAQ records")
    
    # Process Incoterms
    print("[EMBEDDINGS] Processing Incoterms...")
    incoterms_records = read_jsonl('data/knowledge/incoterms/incoterms.jsonl')
    for record in incoterms_records:
        text = record.get('text', '')
        vector = model.encode(text, normalize_embeddings=True).tolist()
        chunks.append({
            'text': text,
            'vector': vector,
            'metadata': {
                'id': record.get('id'),
                'source': 'incoterms',
                'code': record.get('code'),
                'category': record.get('category'),
                'subsection': record.get('subsection'),
            }
        })
    print(f"[EMBEDDINGS] Processed {len(incoterms_records)} incoterms records")
    
    # Process CMR
    print("[EMBEDDINGS] Processing CMR...")
    cmr_records = read_jsonl('data/knowledge/cmr/cmr.jsonl')
    for record in cmr_records:
        text = record.get('text', '')
        vector = model.encode(text, normalize_embeddings=True).tolist()
        chunks.append({
            'text': text,
            'vector': vector,
            'metadata': {
                'id': record.get('id'),
                'source': 'cmr',
                'article_number': record.get('article_number'),
                'subsection': record.get('subsection'),
            }
        })
    print(f"[EMBEDDINGS] Processed {len(cmr_records)} CMR records")
    
    # Process CSV Reports
    print("[EMBEDDINGS] Processing CSV Reports...")
    reports_dir = Path('data/knowledge/reports')
    csv_files = [
        'sales_report_q3_2026.csv',
        'inventory_snapshot.csv',
        'shipment_performance.csv',
        'fleet_utilization.csv',
        'financial_summary.csv',
    ]
    
    total_csv_records = 0
    for csv_file in csv_files:
        csv_path = reports_dir / csv_file
        if csv_path.exists():
            csv_chunks = read_csv_as_chunks(str(csv_path))
            for chunk in csv_chunks:
                vector = model.encode(chunk, normalize_embeddings=True).tolist()
                chunks.append({
                    'text': chunk,
                    'vector': vector,
                    'metadata': {
                        'id': f"{csv_file}:{csv_chunks.index(chunk)}",
                        'source': 'reports',
                        'report_name': csv_file.replace('.csv', '').replace('_', ' '),
                        'report_type': 'operational_data',
                    }
                })
            total_csv_records += len(csv_chunks)
            print(f"[EMBEDDINGS] Processed {len(csv_chunks)} records from {csv_file}")
    
    print(f"[EMBEDDINGS] Processed {total_csv_records} total CSV records")
    
    # Save index
    output_path = 'backend/src/knowledge/data/index.json'
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(chunks, f)
    
    print(f"[EMBEDDINGS] Index built successfully: {len(chunks)} chunks")
    print(f"[EMBEDDINGS] Saved to: {output_path}")

if __name__ == '__main__':
    try:
        generate_embeddings()
    except Exception as e:
        print(f"[EMBEDDINGS] Error: {e}", file=sys.stderr)
        sys.exit(1)
