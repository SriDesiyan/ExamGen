/**
 * Placement Readiness Engine — Unique ExamGen Nexus Feature
 * Maps skill gap data to industry-standard domain scores
 * and generates a placement readiness classification
 */

interface SkillGapReport {
  topicMastery: { topic: string; mastery: number }[];
  overallMastery: number;
}

interface DomainScore {
  domain: string;
  score: number;
  category: 'strength' | 'average' | 'gap';
}

interface PlacementReport {
  overallScore: number;
  classification: 'Industry Ready' | 'Needs Improvement' | 'Beginner';
  badge: string;
  badgeColor: string;
  domains: DomainScore[];
  topStrengths: string[];
  criticalGaps: string[];
  careerSuggestions: string[];
  readinessPercentile: number;
}

// Maps topics to industry domains
const TOPIC_TO_DOMAIN: Record<string, string> = {
  'Data Structures': 'DSA',
  'Algorithms': 'DSA',
  'DBMS': 'Database Engineering',
  'Operating Systems': 'Systems',
  'Networks': 'Network Engineering',
  'Computer Networks': 'Network Engineering',
  'Web Development': 'Full Stack',
  'Machine Learning': 'AI/ML',
  'OOP': 'Software Engineering',
  'General': 'Core CS'
};

const DOMAIN_BENCHMARKS: Record<string, number> = {
  'DSA': 70, 'Database Engineering': 65, 'Systems': 60,
  'Network Engineering': 60, 'Full Stack': 65, 'AI/ML': 55,
  'Software Engineering': 65, 'Core CS': 60
};

export function computePlacementScore(skillGap: SkillGapReport): PlacementReport {
  // Map topics to domains
  const domainScores: Record<string, number[]> = {};
  for (const topic of skillGap.topicMastery) {
    const domain = TOPIC_TO_DOMAIN[topic.topic] || 'Core CS';
    if (!domainScores[domain]) domainScores[domain] = [];
    domainScores[domain].push(topic.mastery);
  }

  // Average per domain
  const domains: DomainScore[] = Object.entries(domainScores).map(([domain, scores]) => {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const benchmark = DOMAIN_BENCHMARKS[domain] || 60;
    return {
      domain,
      score: Math.round(avg),
      category: avg >= benchmark + 10 ? 'strength' : avg >= benchmark - 10 ? 'average' : 'gap'
    };
  });

  // If no domain data, create synthetic ones
  if (domains.length === 0) {
    const base = skillGap.overallMastery;
    domains.push(
      { domain: 'DSA', score: Math.min(100, base + 5), category: base > 65 ? 'strength' : 'gap' },
      { domain: 'Database Engineering', score: Math.min(100, base - 5), category: base > 60 ? 'average' : 'gap' },
      { domain: 'Systems', score: Math.min(100, base), category: base > 60 ? 'average' : 'gap' }
    );
  }

  const overallScore = domains.length > 0
    ? Math.round(domains.reduce((s, d) => s + d.score, 0) / domains.length)
    : skillGap.overallMastery;

  let classification: PlacementReport['classification'] = 'Beginner';
  let badge = '🌱 Beginner';
  let badgeColor = '#6b7280';
  if (overallScore >= 75) { classification = 'Industry Ready'; badge = '🚀 Industry Ready'; badgeColor = '#10b981'; }
  else if (overallScore >= 50) { classification = 'Needs Improvement'; badge = '📈 Needs Improvement'; badgeColor = '#f59e0b'; }

  const topStrengths = domains.filter(d => d.category === 'strength').map(d => d.domain);
  const criticalGaps = domains.filter(d => d.category === 'gap').map(d => d.domain);

  const careerSuggestions = getCareerSuggestions(overallScore, topStrengths);
  const readinessPercentile = Math.min(99, Math.max(1, Math.round(overallScore * 0.9 + Math.random() * 10)));

  return { overallScore, classification, badge, badgeColor, domains, topStrengths, criticalGaps, careerSuggestions, readinessPercentile };
}

function getCareerSuggestions(score: number, strengths: string[]): string[] {
  const base = score >= 75
    ? ['Software Development Engineer', 'Backend Developer', 'Full Stack Engineer']
    : score >= 50
    ? ['Junior Developer', 'QA Engineer', 'Technical Support Engineer']
    : ['Internship opportunities', 'Bootcamp programs', 'Foundation courses'];

  if (strengths.includes('AI/ML')) base.unshift('Machine Learning Engineer');
  if (strengths.includes('DSA')) base.unshift('Competitive Programmer', 'Algorithm Engineer');
  if (strengths.includes('Full Stack')) base.unshift('Full Stack Developer');

  return base.slice(0, 4);
}
