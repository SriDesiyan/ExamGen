/**
 * Skill Gap Analysis Service
 * Analyzes student performance by topic to identify mastery levels and weak areas
 */

interface GradedAnswer {
  questionId: string;
  correct: boolean;
  topicTag?: string | null;
  difficulty?: string;
}

interface TopicMastery {
  topic: string;
  correct: number;
  total: number;
  mastery: number; // 0-100
  level: 'Expert' | 'Proficient' | 'Developing' | 'Beginner';
}

interface SkillGapReport {
  topicMastery: TopicMastery[];
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
  overallMastery: number;
}

const TOPIC_RESOURCES: Record<string, string[]> = {
  'Data Structures': ['Review heap operations', 'Practice tree traversals', 'Study graph algorithms'],
  'DBMS': ['Study ACID properties', 'Practice normalization exercises', 'Review SQL joins'],
  'Operating Systems': ['Study scheduling algorithms', 'Review deadlock conditions', 'Practice memory management problems'],
  'Networks': ['Review OSI model layers', 'Practice subnetting', 'Study TCP/IP protocols'],
  'Algorithms': ['Practice dynamic programming', 'Review sorting complexities', 'Study greedy algorithms'],
  'default': ['Review course materials', 'Practice problems from textbook', 'Attempt mock tests']
};

export function computeSkillGap(gradedAnswers: GradedAnswer[]): SkillGapReport {
  // Group by topic
  const topicMap: Record<string, { correct: number; total: number }> = {};

  for (const answer of gradedAnswers) {
    const topic = answer.topicTag || 'General';
    if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
    topicMap[topic].total++;
    if (answer.correct) topicMap[topic].correct++;
  }

  // Compute mastery per topic
  const topicMastery: TopicMastery[] = Object.entries(topicMap).map(([topic, data]) => {
    const mastery = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    let level: TopicMastery['level'] = 'Beginner';
    if (mastery >= 80) level = 'Expert';
    else if (mastery >= 60) level = 'Proficient';
    else if (mastery >= 40) level = 'Developing';

    return { topic, correct: data.correct, total: data.total, mastery, level };
  }).sort((a, b) => b.mastery - a.mastery);

  const weakAreas = topicMastery.filter(t => t.mastery < 60).map(t => t.topic);
  const strongAreas = topicMastery.filter(t => t.mastery >= 75).map(t => t.topic);

  // Generate recommendations
  const recommendations: string[] = [];
  for (const weak of weakAreas.slice(0, 3)) {
    const resources = TOPIC_RESOURCES[weak] || TOPIC_RESOURCES['default'];
    recommendations.push(...resources.slice(0, 1).map(r => `[${weak}] ${r}`));
  }
  if (recommendations.length === 0) recommendations.push('Excellent performance! Focus on advanced topics to deepen expertise.');

  const overallMastery = topicMastery.length > 0
    ? Math.round(topicMastery.reduce((sum, t) => sum + t.mastery, 0) / topicMastery.length)
    : 0;

  return { topicMastery, weakAreas, strongAreas, recommendations, overallMastery };
}
