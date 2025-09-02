import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Quiz } from './components/Quiz';
import { QuizBuilder } from './components/QuizBuilder';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { localClient } from './utils/local/storage';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'teacher';
  school: string;
  grade?: string;
  classes?: string[];
  points?: number;
  badges?: any[];
  completedQuizzes?: number;
  students?: number;
}

type AppState = 'auth' | 'student-dashboard' | 'teacher-dashboard' | 'quiz' | 'quiz-builder' | 'games';

export default function App() {
  const [appState, setAppState] = useState<AppState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [editQuizId, setEditQuizId] = useState<string | null>(null);

  // Check for saved user session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Check for current session in local storage
      const sessionData = await localClient.getSession();
      
      if (sessionData.data?.session?.access_token) {
        // Get user profile using local client
        const profileResult = await localClient.getProfile(sessionData.data.session.access_token);
        
        if (profileResult.user) {
          const userData = {
            ...profileResult.user,
            accessToken: sessionData.data.session.access_token
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('accessToken', sessionData.data.session.access_token);
          
          if (userData.userType === 'student') {
            setAppState('student-dashboard');
          } else {
            setAppState('teacher-dashboard');
          }
          return;
        }
      }
      
      // Fallback to localStorage if no active session
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        if (userData.userType === 'student') {
          setAppState('student-dashboard');
        } else {
          setAppState('teacher-dashboard');
        }
      }
      
    } catch (error) {
      console.error('Error checking session:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const handleLogin = (userType: 'student' | 'teacher', userData: User) => {
    setUser(userData);
    if (userType === 'student') {
      setAppState('student-dashboard');
      toast.success(`Welcome back, ${userData.name}! Ready to learn?`);
    } else {
      setAppState('teacher-dashboard');
      toast.success(`Welcome back, ${userData.name}! Let's inspire students today.`);
    }
  };

  const handleLogout = async () => {
    try {
      await localClient.signout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('userStats');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('current_session');
    setUser(null);
    setAppState('auth');
    setCurrentQuizId(null);
    setEditQuizId(null);
    toast.info('You have been logged out successfully');
  };

  const handleStartQuiz = (quizId: string) => {
    setCurrentQuizId(quizId);
    setAppState('quiz');
    toast.info('Quiz started! Good luck! 🍀');
  };

  const handleQuizComplete = (score: number, results: any) => {
    const message = score >= 90 ? 'Outstanding performance! 🌟' :
                   score >= 80 ? 'Great job! 🎉' :
                   score >= 70 ? 'Good work! 👍' :
                   score >= 60 ? 'Keep improving! 📚' :
                   'Keep practicing! 💪';
    
    toast.success(`Quiz completed! Score: ${score}% - ${message}`);
    
    // Award XP for quiz completion
    const baseXP = 50;
    const bonusXP = score === 100 ? 25 : 0;
    toast.info(`+${baseXP + bonusXP} XP earned! 🌟`);
  };

  const handleQuizExit = () => {
    setCurrentQuizId(null);
    if (user?.userType === 'student') {
      setAppState('student-dashboard');
    } else {
      setAppState('teacher-dashboard');
    }
  };

  const handleCreateQuiz = () => {
    setEditQuizId(null);
    setAppState('quiz-builder');
  };

  const handleEditQuiz = (quizId: string) => {
    setEditQuizId(quizId);
    setAppState('quiz-builder');
  };

  const handleQuizBuilderExit = () => {
    setEditQuizId(null);
    setAppState('teacher-dashboard');
  };

  // Loading state while checking for saved user
  if (appState === 'auth' && localStorage.getItem('user')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Render appropriate component based on app state */}
      {appState === 'auth' && (
        <AuthPage onLogin={handleLogin} />
      )}
      
      {appState === 'student-dashboard' && user && (
        <StudentDashboard 
          user={user} 
          onStartQuiz={handleStartQuiz}
          onLogout={handleLogout}
        />
      )}
      
      {appState === 'teacher-dashboard' && user && (
        <TeacherDashboard 
          user={user}
          onLogout={handleLogout}
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
        />
      )}
      
      {appState === 'quiz-builder' && user && (
        <QuizBuilder 
          user={user}
          onBack={handleQuizBuilderExit}
          editQuizId={editQuizId}
        />
      )}
      
      {appState === 'quiz' && user && currentQuizId && (
        <Quiz 
          quizId={currentQuizId}
          user={user}
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
        />
      )}

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
}