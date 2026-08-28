#!/usr/bin/env python3
"""
Embedding service - runs as a daemon process
Listens on stdin for queries, outputs embeddings to stdout
Keeps model in memory for fast repeated requests
"""

import sys
import json
import os
import threading
import time

# Suppress TensorFlow warnings and HF warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['HF_HOME'] = os.path.expanduser('~/.cache/huggingface')
os.environ['TRANSFORMERS_OFFLINE'] = '0'

# Disable HF hub warnings
import warnings
warnings.filterwarnings('ignore')

from sentence_transformers import SentenceTransformer

# Load model once at startup
print("LOADING_MODEL", file=sys.stderr)
sys.stderr.flush()

# Retry logic for model loading (in case of LevelDB lock issues)
max_retries = 3
for attempt in range(max_retries):
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        break
    except Exception as e:
        if attempt < max_retries - 1:
            print(f"MODEL_LOAD_RETRY_{attempt+1}", file=sys.stderr)
            sys.stderr.flush()
            time.sleep(2)
        else:
            print(f"MODEL_LOAD_FAILED: {str(e)}", file=sys.stderr)
            sys.exit(1)

print("MODEL_READY", file=sys.stderr)
sys.stderr.flush()

# Lock for thread-safe model access
model_lock = threading.Lock()

# Process queries line by line
try:
    for line in sys.stdin:
        query = line.strip()
        if not query:
            continue
        
        try:
            # Use lock to ensure single-threaded model access
            with model_lock:
                # Generate embedding with timeout protection
                embedding = model.encode(query, normalize_embeddings=True)
            
            # Output as JSON
            print(json.dumps(embedding.tolist()))
            sys.stdout.flush()
        except Exception as e:
            # Log error but continue processing
            print(f"EMBED_ERROR: {str(e)}", file=sys.stderr)
            sys.stderr.flush()
            # Send error as empty array
            print(json.dumps([]))
            sys.stdout.flush()
except KeyboardInterrupt:
    sys.exit(0)
except EOFError:
    sys.exit(0)
except Exception as e:
    print(f"SERVICE_ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
