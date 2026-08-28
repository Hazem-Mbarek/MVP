#!/usr/bin/env python3
"""
Embed a single query using all-MiniLM-L6-v2 with model caching
This script loads the model once and keeps it in memory between calls
(when called repeatedly from Node.js)
"""

import sys
import json
import os

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from sentence_transformers import SentenceTransformer

# Cache model at module level so it persists across calls
_model = None

def get_model():
    """Get or load the model (cached at module level)"""
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def embed_query(text):
    """Embed a single query using cached model"""
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: embed_cached.py <text>\n")
        sys.exit(1)
    
    query = sys.argv[1]
    
    try:
        embedding = embed_query(query)
        # Output as JSON for Node.js to parse
        print(json.dumps(embedding))
        sys.exit(0)
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.exit(1)
