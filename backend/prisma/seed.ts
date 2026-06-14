import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ExamGen Nexus database...');

  const salt = await bcrypt.genSalt(12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@examgen.nexus' },
    update: {},
    create: { name: 'System Administrator', email: 'admin@examgen.nexus', passwordHash: await bcrypt.hash('Admin@123', salt), role: 'ADMIN', isVerified: true }
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@examgen.nexus' },
    update: {},
    create: { name: 'Dr. Sarah Chen', email: 'teacher@examgen.nexus', passwordHash: await bcrypt.hash('Teacher@123', salt), role: 'TEACHER', isVerified: true }
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'alice@examgen.nexus' },
    update: {},
    create: { name: 'Alice Johnson', email: 'alice@examgen.nexus', passwordHash: await bcrypt.hash('Student@123', salt), role: 'STUDENT', isVerified: true }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'bob@examgen.nexus' },
    update: {},
    create: { name: 'Bob Martinez', email: 'bob@examgen.nexus', passwordHash: await bcrypt.hash('Student@123', salt), role: 'STUDENT', isVerified: false }
  });

  const course = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: { name: 'Computer Science Fundamentals', code: 'CS101', description: 'Core CS concepts including DSA, DBMS, OS and Networks', teacherId: teacher.id }
  });

  const dijkstraOptions = JSON.stringify(['BFS', 'DFS', 'Dijkstras Algorithm', 'Bellman-Ford']);

  const exam = await prisma.exam.create({
    data: {
      title: 'Data Structures and Algorithms Midterm',
      description: 'A comprehensive midterm examination covering arrays, linked lists, trees, graphs, and sorting algorithms.',
      courseId: course.id,
      teacherId: teacher.id,
      durationMinutes: 60,
      totalMarks: 20,
      passingScore: 8,
      difficulty: 'MEDIUM',
      isPublished: true,
      shuffleQuestions: true,
      questions: {
        create: [
          { text: 'What is the time complexity of binary search?', type: 'MCQ', options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n^2)']), correctAnswer: 'O(log n)', explanation: 'Binary search halves the search space each iteration, giving O(log n).', difficulty: 'EASY', topicTag: 'Data Structures', marks: 1, orderIndex: 0 },
          { text: 'Which data structure is used in BFS traversal?', type: 'MCQ', options: JSON.stringify(['Stack', 'Queue', 'Heap', 'Tree']), correctAnswer: 'Queue', explanation: 'BFS uses a Queue to process nodes level by level.', difficulty: 'EASY', topicTag: 'Data Structures', marks: 1, orderIndex: 1 },
          { text: 'What is the worst-case time complexity of QuickSort?', type: 'MCQ', options: JSON.stringify(['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)']), correctAnswer: 'O(n^2)', explanation: 'QuickSort degrades to O(n squared) with a bad pivot selection strategy.', difficulty: 'MEDIUM', topicTag: 'Algorithms', marks: 2, orderIndex: 2 },
          { text: 'In a max-heap with n elements, what is the index of the parent of element at index i?', type: 'MCQ', options: JSON.stringify(['i/2', '(i-1)/2', '2i', '2i+1']), correctAnswer: '(i-1)/2', explanation: 'For 0-indexed arrays, the parent of index i is at floor((i-1)/2).', difficulty: 'HARD', topicTag: 'Data Structures', marks: 3, orderIndex: 3 },
          { text: 'Which traversal of a BST gives nodes in sorted order?', type: 'MCQ', options: JSON.stringify(['Preorder', 'Postorder', 'Inorder', 'Level order']), correctAnswer: 'Inorder', explanation: 'Inorder traversal of a BST visits left subtree, root, right subtree producing sorted output.', difficulty: 'EASY', topicTag: 'Data Structures', marks: 1, orderIndex: 4 },
          { text: 'What is dynamic programming primarily used for?', type: 'MCQ', options: JSON.stringify(['Memory management', 'Optimization using overlapping subproblems', 'Network routing', 'Process scheduling']), correctAnswer: 'Optimization using overlapping subproblems', explanation: 'DP breaks problems into overlapping subproblems and stores results to avoid recomputation.', difficulty: 'MEDIUM', topicTag: 'Algorithms', marks: 2, orderIndex: 5 },
          { text: 'Explain the difference between a stack and a queue.', type: 'SHORT', correctAnswer: 'Stack uses LIFO where insertion (push) and deletion (pop) occur at the top. Queue uses FIFO where insertion (enqueue) occurs at the rear and deletion (dequeue) at the front.', difficulty: 'MEDIUM', topicTag: 'Data Structures', marks: 3, orderIndex: 6 },
          { text: 'What does the time complexity O(n log n) signify?', type: 'SHORT', correctAnswer: 'O(n log n) means the algorithm performs n operations each taking log n time, seen in efficient sorting algorithms like merge sort and heap sort.', difficulty: 'EASY', topicTag: 'Algorithms', marks: 2, orderIndex: 7 },
          { text: 'Which graph algorithm finds the shortest path in a weighted graph with non-negative edges?', type: 'MCQ', options: dijkstraOptions, correctAnswer: 'Dijkstras Algorithm', explanation: 'Dijkstras algorithm uses a priority queue to greedily find the shortest path in graphs with non-negative weights.', difficulty: 'HARD', topicTag: 'Algorithms', marks: 3, orderIndex: 8 },
          { text: 'What is the space complexity of merge sort?', type: 'MCQ', options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n^2)']), correctAnswer: 'O(n)', explanation: 'Merge sort requires O(n) auxiliary space for the temporary arrays used during merging.', difficulty: 'MEDIUM', topicTag: 'Algorithms', marks: 2, orderIndex: 9 },
        ]
      }
    }
  });

  console.log('Seed complete!');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@examgen.nexus   / Admin@123');
  console.log('  Teacher: teacher@examgen.nexus / Teacher@123');
  console.log('  Student: alice@examgen.nexus   / Student@123 (verified)');
  console.log('  Student: bob@examgen.nexus     / Student@123 (unverified)');
  console.log('Created exam ID: ' + exam.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
