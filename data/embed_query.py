#!/usr/bin/env python3
"""
Embed a single query using all-MiniLM-L6-v2
Called by Node.js backend for runtime query embedding
"""

import sys
import json
from sentence_transformers import SentenceTransformer

def embed_query(text):
    """Embed a single query and return as JSON"""
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps([]), file=sys.stderr)
        sys.exit(1)
    
    query = sys.argv[1]
    
    try:
        embedding = embed_query(query)
        # Output as JSON for Node.js to parse
        print(json.dumps(embedding))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
