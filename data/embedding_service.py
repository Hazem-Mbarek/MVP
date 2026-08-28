#!/usr/bin/env python3
"""
Embedding service - runs as a daemon process
Listens on stdin for queries, outputs embeddings to stdout
Keeps model in memory for fast repeated requests
"""

import sys
import json
import os

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from sentence_transformers import SentenceTransformer

# Load model once at startup
print("LOADING_MODEL", file=sys.stderr)
sys.stderr.flush()

model = SentenceTransformer('all-MiniLM-L6-v2')

print("MODEL_READY", file=sys.stderr)
sys.stderr.flush()

# Process queries line by line
try:
    for line in sys.stdin:
        query = line.strip()
        if not query:
            continue
        
        try:
            # Generate embedding
            embedding = model.encode(query, normalize_embeddings=True)
            
            # Output as JSON
            print(json.dumps(embedding.tolist()))
            sys.stdout.flush()
        except Exception as e:
            # Send error as empty array
            print(json.dumps([]))
            sys.stdout.flush()
except KeyboardInterrupt:
    sys.exit(0)
except EOFError:
    sys.exit(0)
