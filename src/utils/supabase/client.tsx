import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create Supabase client for frontend
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API client for our custom backend
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1ce175a8`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  private getAuthHeaders(accessToken?: string) {
    return accessToken ? {
      'Authorization': `Bearer ${accessToken}`
    } : {};
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
    return this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async signin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // User profile methods
  async getProfile(accessToken: string) {
    return this.makeRequest('/profile', {
      headers: this.getAuthHeaders(accessToken)
    });
  }

  async updateProgress(accessToken: string, progressData: {
    points?: number;
    quiz_score: number;
    quiz_id: string;
    subject: string;
  }) {
    return this.makeRequest('/progress', {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(progressData)
    });
  }

  // Quiz methods
  async getQuizzes(accessToken: string) {
    return this.makeRequest('/quizzes', {
      headers: this.getAuthHeaders(accessToken)
    });
  }

  async getQuiz(accessToken: string, quizId: string) {
    return this.makeRequest(`/quiz/${quizId}`, {
      headers: this.getAuthHeaders(accessToken)
    });
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
    teacherId?: string;
    createdAt?: string;
  }) {
    return this.makeRequest('/quiz', {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(quizData)
    });
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
    teacherId?: string;
    createdAt?: string;
  }) {
    return this.makeRequest(`/quiz/${quizId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(quizData)
    });
  }

  async submitQuiz(accessToken: string, quizId: string, submissionData: {
    answers: { [key: string]: number };
    score: number;
    timeSpent: number;
    earnedPoints: number;
  }) {
    return this.makeRequest(`/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(submissionData)
    });
  }

  // Analytics methods
  async getLeaderboard(accessToken: string) {
    return this.makeRequest('/leaderboard', {
      headers: this.getAuthHeaders(accessToken)
    });
  }

  async getStudentAnalytics(accessToken: string) {
    return this.makeRequest('/analytics/students', {
      headers: this.getAuthHeaders(accessToken)
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

export const apiClient = new ApiClient();