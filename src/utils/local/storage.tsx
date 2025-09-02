// Local storage-based client to replace Supabase functionality
interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'teacher';
  school: string;
  grade?: string;
  classes?: string[];
  points?: number;
  totalXP?: number;
  badges?: any[];
  completedQuizzes?: number;
  students?: number;
  streak?: number;
  averageScore?: number;
  createdAt: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  timeLimit: number;
  difficulty: string;
  targetClass?: string;
  description?: string;
  instructions?: string;
  status?: string;
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
}

interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  answers: { [key: string]: number };
  score: number;
  timeSpent: number;
  earnedPoints: number;
  submittedAt: string;
}

interface ProgressData {
  userId: string;
  points: number;
  completedQuizzes: number;
  badges: any[];
  subjects: { [key: string]: { score: number; quizzes: number } };
}

// Demo data for initial setup
const DEMO_USERS: User[] = [
  {
    id: 'student-1',
    email: 'demo@student.com',
    name: 'Demo Student',
    userType: 'student',
    school: 'Demo School',
    grade: '9',
    points: 1250,
    totalXP: 500,
    badges: [
      { id: 'math-explorer', name: 'Math Explorer', earned: true, date: '2024-01-15' },
      { id: 'quiz-master', name: 'Quiz Master', earned: true, date: '2024-02-01' }
    ],
    completedQuizzes: 12,
    streak: 5,
    averageScore: 87,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'teacher-1',
    email: 'demo@teacher.com',
    name: 'Demo Teacher',
    userType: 'teacher',
    school: 'Demo School',
    classes: ['Grade 9A', 'Grade 9B', 'Grade 10A'],
    students: 85,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const DEMO_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Basic Mathematics',
    subject: 'Mathematics',
    difficulty: 'Easy',
    timeLimit: 600, // 10 minutes
    teacherId: 'teacher-1',
    targetClass: 'Grade 9A',
    description: 'Test your knowledge of basic mathematical operations',
    instructions: 'Answer all questions to the best of your ability. You have 10 minutes to complete this quiz.',
    status: 'published',
    questions: [
      {
        id: 'q1',
        question: 'What is 15 + 23?',
        type: 'multiple-choice',
        options: ['35', '38', '40', '42'],
        correctAnswer: 1,
        points: 10
      },
      {
        id: 'q2',
        question: 'What is 8 × 7?',
        type: 'multiple-choice',
        options: ['54', '56', '58', '60'],
        correctAnswer: 1,
        points: 10
      },
      {
        id: 'q3',
        question: 'What is 144 ÷ 12?',
        type: 'multiple-choice',
        options: ['10', '11', '12', '13'],
        correctAnswer: 2,
        points: 10
      }
    ],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'quiz-2',
    title: 'Science Fundamentals',
    subject: 'Science',
    difficulty: 'Medium',
    timeLimit: 900, // 15 minutes
    teacherId: 'teacher-1',
    targetClass: 'Grade 9B',
    description: 'Explore basic concepts in physics and chemistry',
    instructions: 'Read each question carefully and select the best answer.',
    status: 'published',
    questions: [
      {
        id: 'q1',
        question: 'What is the chemical symbol for water?',
        type: 'multiple-choice',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 0,
        points: 15
      },
      {
        id: 'q2',
        question: 'What force keeps planets in orbit around the sun?',
        type: 'multiple-choice',
        options: ['Magnetism', 'Gravity', 'Friction', 'Centrifugal force'],
        correctAnswer: 1,
        points: 15
      }
    ],
    createdAt: '2024-01-20T14:30:00Z'
  }
];

class LocalStorageClient {
  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with demo data if not exists
    if (!localStorage.getItem('app_users')) {
      localStorage.setItem('app_users', JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem('app_quizzes')) {
      localStorage.setItem('app_quizzes', JSON.stringify(DEMO_QUIZZES));
    }
    if (!localStorage.getItem('app_submissions')) {
      localStorage.setItem('app_submissions', JSON.stringify([]));
    }
    if (!localStorage.getItem('app_progress')) {
      localStorage.setItem('app_progress', JSON.stringify([]));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem('app_users') || '[]');
  }

  private setUsers(users: User[]) {
    localStorage.setItem('app_users', JSON.stringify(users));
  }

  private getQuizzes(): Quiz[] {
    return JSON.parse(localStorage.getItem('app_quizzes') || '[]');
  }

  private setQuizzes(quizzes: Quiz[]) {
    localStorage.setItem('app_quizzes', JSON.stringify(quizzes));
  }

  private getSubmissions(): QuizSubmission[] {
    return JSON.parse(localStorage.getItem('app_submissions') || '[]');
  }

  private setSubmissions(submissions: QuizSubmission[]) {
    localStorage.setItem('app_submissions', JSON.stringify(submissions));
  }

  private getProgressData(): ProgressData[] {
    return JSON.parse(localStorage.getItem('app_progress') || '[]');
  }

  private setProgressData(progressData: ProgressData[]) {
    localStorage.setItem('app_progress', JSON.stringify(progressData));
  }

  // Auth methods
  async signup(userData: {
    email: string;
    password: string;
    name: string;
    userType: 'student' | 'teacher';
    grade?: string;
    school: string;
  }) {
    const users = this.getUsers();
    const existingUser = users.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: this.generateId(),
      email: userData.email,
      name: userData.name,
      userType: userData.userType,
      school: userData.school,
      grade: userData.grade,
      points: userData.userType === 'student' ? 0 : undefined,
      totalXP: userData.userType === 'student' ? 0 : undefined,
      badges: userData.userType === 'student' ? [] : undefined,
      completedQuizzes: userData.userType === 'student' ? 0 : undefined,
      streak: userData.userType === 'student' ? 0 : undefined,
      averageScore: userData.userType === 'student' ? 0 : undefined,
      classes: userData.userType === 'teacher' ? [] : undefined,
      students: userData.userType === 'teacher' ? 0 : undefined,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.setUsers(users);

    return { user: newUser };
  }

  async signin(email: string, password: string) {
    // Simple validation - in real app you'd hash passwords
    const users = this.getUsers();
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate a mock access token
    const accessToken = btoa(`${user.id}:${Date.now()}`);
    
    return {
      session: {
        access_token: accessToken,
        user: user
      }
    };
  }

  async signout() {
    // Clear current session
    localStorage.removeItem('current_session');
    return { error: null };
  }

  async getSession() {
    const sessionData = localStorage.getItem('current_session');
    if (sessionData) {
      return { data: JSON.parse(sessionData) };
    }
    return { data: { session: null } };
  }

  // User profile methods
  async getProfile(accessToken: string) {
    try {
      const decoded = atob(accessToken);
      const [userId] = decoded.split(':');
      
      const users = this.getUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return { user };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async updateProgress(accessToken: string, progressData: {
    points?: number;
    quiz_score: number;
    quiz_id: string;
    subject: string;
  }) {
    const profile = await this.getProfile(accessToken);
    const userId = profile.user.id;
    
    const progressArray = this.getProgressData();
    let userProgress = progressArray.find(p => p.userId === userId);
    
    if (!userProgress) {
      userProgress = {
        userId,
        points: 0,
        completedQuizzes: 0,
        badges: [],
        subjects: {}
      };
      progressArray.push(userProgress);
    }

    // Update progress
    if (progressData.points) {
      userProgress.points += progressData.points;
    }
    userProgress.completedQuizzes += 1;
    
    if (!userProgress.subjects[progressData.subject]) {
      userProgress.subjects[progressData.subject] = { score: 0, quizzes: 0 };
    }
    
    userProgress.subjects[progressData.subject].score += progressData.quiz_score;
    userProgress.subjects[progressData.subject].quizzes += 1;

    // Update user record
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].points = userProgress.points;
      users[userIndex].completedQuizzes = userProgress.completedQuizzes;
      this.setUsers(users);
    }

    this.setProgressData(progressArray);
    return { success: true };
  }

  // Quiz methods
  async getQuizzes(accessToken: string) {
    const quizzes = this.getQuizzes();
    return { quizzes };
  }

  async getQuiz(accessToken: string, quizId: string) {
    const quizzes = this.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return { quiz };
  }

  async createQuiz(accessToken: string, quizData: {
    title: string;
    subject: string;
    questions: any[];
    timeLimit: number;
    difficulty: string;
    targetClass?: string;
    description?: string;
    instructions?: string;
    status?: string;
  }) {
    const profile = await this.getProfile(accessToken);
    const teacherId = profile.user.id;

    const newQuiz: Quiz = {
      id: this.generateId(),
      ...quizData,
      teacherId,
      status: quizData.status || 'draft',
      createdAt: new Date().toISOString()
    };

    const quizzes = this.getQuizzes();
    quizzes.push(newQuiz);
    this.setQuizzes(quizzes);

    return { quiz: newQuiz };
  }

  async updateQuiz(accessToken: string, quizId: string, quizData: {
    title: string;
    subject: string;
    questions: any[];
    timeLimit: number;
    difficulty: string;
    targetClass?: string;
    description?: string;
    instructions?: string;
    status?: string;
  }) {
    const quizzes = this.getQuizzes();
    const quizIndex = quizzes.findIndex(q => q.id === quizId);
    
    if (quizIndex === -1) {
      throw new Error('Quiz not found');
    }

    quizzes[quizIndex] = {
      ...quizzes[quizIndex],
      ...quizData,
      updatedAt: new Date().toISOString()
    };

    this.setQuizzes(quizzes);
    return { quiz: quizzes[quizIndex] };
  }

  async submitQuiz(accessToken: string, quizId: string, submissionData: {
    answers: { [key: string]: number };
    score: number;
    timeSpent: number;
    earnedPoints: number;
  }) {
    const profile = await this.getProfile(accessToken);
    const userId = profile.user.id;

    const submission: QuizSubmission = {
      id: this.generateId(),
      quizId,
      userId,
      ...submissionData,
      submittedAt: new Date().toISOString()
    };

    const submissions = this.getSubmissions();
    submissions.push(submission);
    this.setSubmissions(submissions);

    return { submission };
  }

  // Analytics methods
  async getLeaderboard(accessToken: string) {
    const users = this.getUsers().filter(u => u.userType === 'student');
    const leaderboard = users
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map((user, index) => ({
        rank: index + 1,
        name: user.name,
        points: user.points || 0,
        school: user.school,
        badges: user.badges?.length || 0
      }));

    return { leaderboard };
  }

  async getStudentAnalytics(accessToken: string) {
    const profile = await this.getProfile(accessToken);
    const teacherId = profile.user.id;
    
    const quizzes = this.getQuizzes().filter(q => q.teacherId === teacherId);
    const submissions = this.getSubmissions();
    const users = this.getUsers().filter(u => u.userType === 'student');

    const analytics = {
      totalQuizzes: quizzes.length,
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0 
        ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length 
        : 0,
      activeStudents: users.length,
      recentActivity: submissions
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10)
        .map(s => {
          const user = users.find(u => u.id === s.userId);
          const quiz = quizzes.find(q => q.id === s.quizId);
          return {
            studentName: user?.name || 'Unknown',
            quizTitle: quiz?.title || 'Unknown Quiz',
            score: s.score,
            submittedAt: s.submittedAt
          };
        })
    };

    return { analytics };
  }

  async updateProfile(accessToken: string, updates: {
    totalXP?: number;
    points?: number;
    streak?: number;
    averageScore?: number;
  }) {
    const profile = await this.getProfile(accessToken);
    const userId = profile.user.id;
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.setUsers(users);
      return { user: users[userIndex] };
    }
    
    throw new Error('User not found');
  }

  async healthCheck() {
    return { status: 'ok', message: 'Local storage client is working' };
  }
}

export const localClient = new LocalStorageClient();