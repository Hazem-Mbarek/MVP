/**
 * Vector search with in-memory index
 */

import fs from "fs"
import path from "path"
import { embed } from "./embeddings"

interface ChunkMetadata {
  id: string
  source: string
  article_number?: number
  code?: string
  subsection?: string
  category?: string
}

interface IndexedChunk {
  text: string
  vector: number[]
  metadata: ChunkMetadata
}

interface SearchResult {
  text: string
  metadata: ChunkMetadata
  similarity: number
}

let index: IndexedChunk[] = []

export async function loadIndex() {
  console.log("[SEARCH] Loading vector index...")
  
  try {
    const indexPath = path.join(__dirname, "./data/index.json")
    
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8")
      index = JSON.parse(content)
      console.log(`[SEARCH] Loaded ${index.length} chunks from index`)
    } else {
      console.warn("[SEARCH] Index file not found, will need to build embeddings")
    }
  } catch (error) {
    console.error("[SEARCH] Error loading index:", error)
    throw error
  }
}

export async function searchKnowledge(
  query: string,
  sourceFilter?: string,
  topK: number = 5
): Promise<SearchResult[]> {
  if (index.length === 0) {
    return []
  }

  try {
    console.log(`[SEARCH] Searching for: "${query}"`)
    const queryVector = await embed(query)
    
    // Calculate similarity for all chunks
    const scores = index.map((chunk) => ({
      ...chunk,
      similarity: cosineSimilarity(queryVector, chunk.vector),
    }))
    
    // Filter by source if specified
    let filtered = scores
    if (sourceFilter) {
      filtered = scores.filter(s => s.metadata.source === sourceFilter)
    }
    
    // Sort by similarity and take top-k
    const results = filtered
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(({ text, metadata, similarity }) => ({
        text,
        metadata,
        similarity,
      }))
    
    console.log(`[SEARCH] Found ${results.length} results (best similarity: ${results[0]?.similarity.toFixed(3) || 'N/A'})`)
    return results
  } catch (error) {
    console.error("[SEARCH] Error during search:", error)
    throw error
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (normA * normB)
}

export function addToIndex(chunks: IndexedChunk[]) {
  index.push(...chunks)
}

export function getIndexSize(): number {
  return index.length
}
