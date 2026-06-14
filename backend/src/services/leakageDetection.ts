/**
 * Question Leakage Detection Service
 * Uses cosine similarity of TF-IDF vectors to detect duplicate/similar questions
 */

interface QuestionRef {
  id: string;
  text: string;
  examId: string;
}

interface LeakageResult {
  hasDuplicates: boolean;
  matches: { id: string; examId: string; similarity: number; text: string }[];
  highestSimilarity: number;
}

export async function detectLeakage(newText: string, existingQuestions: QuestionRef[]): Promise<LeakageResult> {
  if (existingQuestions.length === 0) return { hasDuplicates: false, matches: [], highestSimilarity: 0 };

  const newVec = tfidf(newText, existingQuestions.map(q => q.text));
  const matches: LeakageResult['matches'] = [];

  for (const q of existingQuestions) {
    const existingVec = tfidf(q.text, [newText, ...existingQuestions.map(x => x.text)]);
    const sim = cosineSimilarity(newVec, existingVec);
    if (sim > 0.45) {
      matches.push({ id: q.id, examId: q.examId, similarity: Math.round(sim * 100), text: q.text.slice(0, 80) + '...' });
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  return {
    hasDuplicates: matches.length > 0,
    matches: matches.slice(0, 3),
    highestSimilarity: matches[0]?.similarity || 0
  };
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
}

function tfidf(text: string, corpus: string[]): Map<string, number> {
  const tokens = tokenize(text);
  const termFreq: Map<string, number> = new Map();
  tokens.forEach(t => termFreq.set(t, (termFreq.get(t) || 0) + 1));

  const corpusTokens = corpus.map(tokenize);
  const idf: Map<string, number> = new Map();
  termFreq.forEach((_, term) => {
    const docsWithTerm = corpusTokens.filter(doc => doc.includes(term)).length;
    idf.set(term, Math.log((corpus.length + 1) / (docsWithTerm + 1)) + 1);
  });

  const vec: Map<string, number> = new Map();
  termFreq.forEach((tf, term) => {
    vec.set(term, (tf / tokens.length) * (idf.get(term) || 1));
  });
  return vec;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  a.forEach((valA, term) => {
    const valB = b.get(term) || 0;
    dot += valA * valB;
    magA += valA * valA;
  });
  b.forEach(val => { magB += val * val; });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
