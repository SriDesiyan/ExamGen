/**
 * Adaptive Assessment Engine
 * Implements Item Response Theory-inspired difficulty ladder
 * 
 * Algorithm:
 *   - Correct answer → move up one difficulty level
 *   - Wrong answer → move down one difficulty level  
 *   - Questions already answered are excluded
 * 
 * Goal: Target ~60-70% success rate per student (Vygotsky's Zone of Proximal Development)
 */

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Question {
  id: string;
  difficulty: string;
  topicTag?: string | null;
  text: string;
  type: string;
  options?: string | null;
  marks: number;
}

const DIFFICULTY_LADDER: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

export function selectNextQuestion(
  allQuestions: Question[],
  currentDifficulty: Difficulty,
  lastCorrect: boolean,
  answeredIds: string[] = []
): Question | null {
  // Determine target difficulty
  const currentIndex = DIFFICULTY_LADDER.indexOf(currentDifficulty);
  let targetIndex = currentIndex;

  if (lastCorrect && currentIndex < 2) targetIndex = currentIndex + 1; // level up
  if (!lastCorrect && currentIndex > 0) targetIndex = currentIndex - 1; // level down

  const targetDifficulty = DIFFICULTY_LADDER[targetIndex];
  const unanswered = allQuestions.filter(q => !answeredIds.includes(q.id));

  if (unanswered.length === 0) return null;

  // Try to find question at target difficulty
  let candidates = unanswered.filter(q => q.difficulty === targetDifficulty);

  // Fallback to any difficulty if no target-difficulty questions left
  if (candidates.length === 0) candidates = unanswered;
  if (candidates.length === 0) return null;

  // Pick randomly among candidates (avoids predictability)
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function computeAdaptivePath(questions: Question[], answers: { questionId: string; correct: boolean }[]): {
  difficulty_progression: string[];
  adaptations: number;
  final_level: Difficulty;
} {
  let currentDiff: Difficulty = 'MEDIUM';
  const progression: string[] = ['MEDIUM'];
  let adaptations = 0;

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) continue;

    const currentIdx = DIFFICULTY_LADDER.indexOf(currentDiff);
    if (answer.correct && currentIdx < 2) {
      currentDiff = DIFFICULTY_LADDER[currentIdx + 1] as Difficulty;
      adaptations++;
    } else if (!answer.correct && currentIdx > 0) {
      currentDiff = DIFFICULTY_LADDER[currentIdx - 1] as Difficulty;
      adaptations++;
    }
    progression.push(currentDiff);
  }

  return { difficulty_progression: progression, adaptations, final_level: currentDiff };
}
