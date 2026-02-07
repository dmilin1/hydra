import { getEmbedding } from "../api/AI";
import { DOCUMENTATION } from "../constants/documentation";

export type VectorSearchResult = {
  id: DocumentationKey;
  score: number; // Cosine similarity: 1 = identical, 0 = orthogonal, -1 = opposite
};

export type DocumentationKey = keyof typeof DOCUMENTATION;

export class DocumentationSearch {
  private readonly vectors: Float32Array;
  private readonly dimension: number;
  private readonly count: number;
  private readonly ids: DocumentationKey[];

  constructor() {
    const entries = Object.entries(DOCUMENTATION);

    this.count = entries.length;
    this.dimension = entries[0][1].vector.length;
    this.ids = new Array(this.count);
    this.vectors = new Float32Array(this.count * this.dimension);

    for (let i = 0; i < entries.length; i++) {
      const [id, doc] = entries[i];
      this.ids[i] = id as DocumentationKey;
      const offset = i * this.dimension;
      for (let j = 0; j < this.dimension; j++) {
        this.vectors[offset + j] = doc.vector[j];
      }
    }
  }

  async find(query: string, k: number) {
    const queryVector = await getEmbedding(query);
    const results = this.findNearest(queryVector, k);
    return results.map((result) => result.id);
  }

  private findNearest(
    query: number[] | Float32Array,
    k: number,
  ): VectorSearchResult[] {
    if (this.count === 0 || k <= 0) return [];

    k = Math.min(k, this.count);

    // Compute all dot products (= cosine similarity since vectors are normalized)
    const scores = this.computeAllDotProducts(query);

    // Select top k results
    return this.selectTopK(scores, k);
  }

  /**
   * Uses loop unrolling for better performance. I tested this
   * and the performance difference is significant.
   */
  private computeAllDotProducts(query: number[] | Float32Array): Float32Array {
    const scores = new Float32Array(this.count);
    const dim = this.dimension;
    const vectors = this.vectors;

    const unrollEnd = dim - (dim % 16);

    for (let i = 0; i < this.count; i++) {
      const offset = i * dim;
      let dot = 0;

      // Unroll by 16 - reduces loop overhead, helps JIT optimization
      let j = 0;
      for (; j < unrollEnd; j += 16) {
        dot +=
          query[j] * vectors[offset + j] +
          query[j + 1] * vectors[offset + j + 1] +
          query[j + 2] * vectors[offset + j + 2] +
          query[j + 3] * vectors[offset + j + 3] +
          query[j + 4] * vectors[offset + j + 4] +
          query[j + 5] * vectors[offset + j + 5] +
          query[j + 6] * vectors[offset + j + 6] +
          query[j + 7] * vectors[offset + j + 7] +
          query[j + 8] * vectors[offset + j + 8] +
          query[j + 9] * vectors[offset + j + 9] +
          query[j + 10] * vectors[offset + j + 10] +
          query[j + 11] * vectors[offset + j + 11] +
          query[j + 12] * vectors[offset + j + 12] +
          query[j + 13] * vectors[offset + j + 13] +
          query[j + 14] * vectors[offset + j + 14] +
          query[j + 15] * vectors[offset + j + 15];
      }

      for (; j < dim; j++) {
        dot += query[j] * vectors[offset + j];
      }

      scores[i] = dot;
    }

    return scores;
  }

  private selectTopK(scores: Float32Array, k: number): VectorSearchResult[] {
    const topK: { idx: number; score: number }[] = [];
    let minScore = -Infinity;

    for (let i = 0; i < this.count; i++) {
      const score = scores[i];

      if (topK.length < k || score > minScore) {
        // Binary search for insertion point (descending order)
        let left = 0;
        let right = topK.length;
        while (left < right) {
          const mid = (left + right) >>> 1;
          if (topK[mid].score > score) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }

        topK.splice(left, 0, { idx: i, score });
        if (topK.length > k) {
          topK.pop();
        }

        minScore = topK[topK.length - 1].score;
      }
    }

    return topK.map(({ idx, score }) => ({ id: this.ids[idx], score }));
  }
}
