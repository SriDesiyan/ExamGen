/**
 * AI Question Generation Service
 * Supports: mock (deterministic demo), OpenAI, Gemini
 * Provider is swappable via AI_PROVIDER env variable
 */

export interface GeneratedQuestion {
  text: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topicTag: string;
  marks: number;
}

export async function generateQuestionsFromText(
  topic: string,
  count: number = 5,
  difficulty: string = 'MEDIUM',
  type: string = 'MCQ'
): Promise<GeneratedQuestion[]> {
  const provider = process.env.AI_PROVIDER || 'mock';
  
  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return generateWithOpenAI(topic, count, difficulty, type);
  }
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    return generateWithGemini(topic, count, difficulty, type);
  }
  return generateMock(topic, count, difficulty, type);
}

// ─── Mock Generator (deterministic, realistic output) ───────────────────────
const questionTemplates: Record<string, any[]> = {
  'Data Structures': [
    { text: 'What is the time complexity of searching in a balanced BST?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 'O(log n)', explanation: 'In a balanced BST, the height is log(n), so search takes O(log n) time.', difficulty: 'MEDIUM' },
    { text: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Heap', 'Tree'], correct: 'Queue', explanation: 'Queue follows First-In-First-Out (FIFO) principle.', difficulty: 'EASY' },
    { text: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 'O(n²)', explanation: 'QuickSort degrades to O(n²) when the pivot is always the smallest or largest element.', difficulty: 'MEDIUM' },
    { text: 'In a max-heap, which property must hold?', options: ['Parent ≤ child', 'Parent ≥ child', 'Sorted left to right', 'All leaves at same level'], correct: 'Parent ≥ child', explanation: 'In a max-heap, every parent node must be greater than or equal to its children.', difficulty: 'EASY' },
    { text: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 'O(n)', explanation: 'Merge sort requires O(n) auxiliary space for the merge operation.', difficulty: 'MEDIUM' },
  ],
  'DBMS': [
    { text: 'Which normal form eliminates transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: '3NF', explanation: '3NF removes transitive dependencies by ensuring non-key attributes depend only on the primary key.', difficulty: 'MEDIUM' },
    { text: 'What does ACID stand for in databases?', options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Consistency, Integrity, Durability', 'Atomicity, Concurrency, Isolation, Data', 'Accuracy, Completeness, Isolation, Durability'], correct: 'Atomicity, Consistency, Isolation, Durability', explanation: 'ACID properties ensure reliable database transactions.', difficulty: 'EASY' },
    { text: 'Which join returns all rows from both tables, with NULLs where no match?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correct: 'FULL OUTER JOIN', explanation: 'FULL OUTER JOIN returns all rows from both tables with NULLs filling unmatched columns.', difficulty: 'MEDIUM' },
    { text: 'What is a deadlock in DBMS?', options: ['When two transactions wait indefinitely for each other', 'When a query takes too long', 'When data is corrupted', 'When the index is broken'], correct: 'When two transactions wait indefinitely for each other', explanation: 'A deadlock occurs when two or more transactions are waiting for each other to release locks.', difficulty: 'MEDIUM' },
    { text: 'Which SQL clause is used to filter groups?', options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'], correct: 'HAVING', explanation: 'HAVING filters groups created by GROUP BY, while WHERE filters individual rows.', difficulty: 'EASY' },
  ],
  'Operating Systems': [
    { text: 'Which scheduling algorithm gives the best average waiting time?', options: ['FCFS', 'SJF', 'Round Robin', 'Priority'], correct: 'SJF', explanation: 'Shortest Job First minimizes average waiting time but may cause starvation.', difficulty: 'MEDIUM' },
    { text: 'What is thrashing in OS?', options: ['Excessive paging causing low CPU utilization', 'A CPU overheating issue', 'Memory corruption', 'A scheduling algorithm'], correct: 'Excessive paging causing low CPU utilization', explanation: 'Thrashing occurs when a system spends more time swapping pages than executing processes.', difficulty: 'HARD' },
    { text: 'Which page replacement algorithm suffers from Belady\'s anomaly?', options: ['LRU', 'FIFO', 'Optimal', 'LFU'], correct: 'FIFO', explanation: 'FIFO can suffer from Belady\'s anomaly where more frames lead to more page faults.', difficulty: 'HARD' },
    { text: 'What is a semaphore used for?', options: ['Memory management', 'Process synchronization', 'CPU scheduling', 'I/O handling'], correct: 'Process synchronization', explanation: 'Semaphores are used to control access to shared resources and synchronize processes.', difficulty: 'MEDIUM' },
    { text: 'In a process state diagram, which state comes after "Ready"?', options: ['Blocked', 'Running', 'New', 'Terminated'], correct: 'Running', explanation: 'After being scheduled, a process moves from Ready to Running state.', difficulty: 'EASY' },
  ],
  'Networks': [
    { text: 'Which layer of OSI model handles routing?', options: ['Physical', 'Data Link', 'Network', 'Transport'], correct: 'Network', explanation: 'The Network layer (Layer 3) is responsible for logical addressing and routing.', difficulty: 'EASY' },
    { text: 'What is the purpose of the TCP three-way handshake?', options: ['Data encryption', 'Establishing a reliable connection', 'DNS resolution', 'IP address assignment'], correct: 'Establishing a reliable connection', explanation: 'SYN, SYN-ACK, ACK sequence establishes a reliable TCP connection.', difficulty: 'MEDIUM' },
    { text: 'Which protocol operates at the Application layer?', options: ['IP', 'TCP', 'HTTP', 'Ethernet'], correct: 'HTTP', explanation: 'HTTP is an Application layer protocol for web communication.', difficulty: 'EASY' },
    { text: 'What does CIDR notation /24 represent?', options: ['24 hosts', '24 subnets', '255.255.255.0 subnet mask', '24 routers'], correct: '255.255.255.0 subnet mask', explanation: '/24 means the first 24 bits are network bits, leaving 8 bits for hosts (255.255.255.0).', difficulty: 'MEDIUM' },
    { text: 'Which routing protocol uses Dijkstra\'s algorithm?', options: ['RIP', 'BGP', 'OSPF', 'EIGRP'], correct: 'OSPF', explanation: 'OSPF (Open Shortest Path First) uses Dijkstra\'s algorithm to compute shortest paths.', difficulty: 'HARD' },
  ]
};

function generateMock(topic: string, count: number, difficulty: string, type: string): GeneratedQuestion[] {
  const topicKey = Object.keys(questionTemplates).find(k => topic.toLowerCase().includes(k.toLowerCase())) || 'Data Structures';
  const templates = questionTemplates[topicKey] || questionTemplates['Data Structures'];
  
  const filtered = difficulty === 'EASY' 
    ? templates.filter(t => t.difficulty === 'EASY')
    : difficulty === 'HARD' 
    ? templates.filter(t => t.difficulty === 'HARD')
    : templates;

  const pool = filtered.length > 0 ? filtered : templates;
  const result: GeneratedQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const t = pool[i % pool.length];
    result.push({
      text: t.text,
      type,
      options: type === 'MCQ' ? t.options : undefined,
      correctAnswer: t.correct,
      explanation: t.explanation,
      difficulty: t.difficulty || difficulty,
      topicTag: topicKey,
      marks: difficulty === 'HARD' ? 3 : difficulty === 'EASY' ? 1 : 2
    });
  }
  return result;
}

// ─── OpenAI Generator ───────────────────────────────────────────────────────
async function generateWithOpenAI(topic: string, count: number, difficulty: string, type: string): Promise<GeneratedQuestion[]> {
  try {
    const { default: OpenAI } = await import('openai' as any);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildPrompt(topic, count, difficulty, type);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return parsed.questions || generateMock(topic, count, difficulty, type);
  } catch {
    return generateMock(topic, count, difficulty, type);
  }
}

// ─── Gemini Generator ───────────────────────────────────────────────────────
async function generateWithGemini(topic: string, count: number, difficulty: string, type: string): Promise<GeneratedQuestion[]> {
  try {
    const prompt = buildPrompt(topic, count, difficulty, type);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || generateMock(topic, count, difficulty, type);
    }
    return generateMock(topic, count, difficulty, type);
  } catch {
    return generateMock(topic, count, difficulty, type);
  }
}

function buildPrompt(topic: string, count: number, difficulty: string, type: string): string {
  return `Generate ${count} ${difficulty} difficulty ${type} questions about "${topic}" for an examination platform.
Return a JSON object with this exact structure:
{
  "questions": [
    {
      "text": "question text",
      "type": "${type}",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "option B",
      "explanation": "why this is correct",
      "difficulty": "${difficulty}",
      "topicTag": "${topic}",
      "marks": 2
    }
  ]
}
Make questions academically rigorous and appropriate for engineering students.`;
}
