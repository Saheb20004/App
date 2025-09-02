import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Games } from './Games';
import { ProgressTracker } from './ProgressTracker';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  Users, 
  Play,
  CheckCircle,
  Lock,
  Award,
  TrendingUp,
  Brain,
  Zap,
  Gamepad2,
  Crown
} from 'lucide-react';
import { localClient } from '../utils/local/storage';
import { calculateLevel, awardXP, XP_REWARDS, getLevelProgress } from '../utils/leveling';
import { toast } from 'sonner@2.0.3';

interface StudentDashboardProps {
  user: any;
  onStartQuiz: (quizId: string) => void;
  onLogout: () => void;
}

interface UserStats {
  totalPoints: number;
  totalXP: number;
  streak: number;
  completedQuizzes: number;
  averageScore: number;
}

// Mock data for demonstration
const mockSubjects = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📊',
    progress: 75,
    totalLessons: 20,
    completedLessons: 15,
    nextLesson: 'Algebra Basics',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    progress: 60,
    totalLessons: 18,
    completedLessons: 11,
    nextLesson: 'Chemical Reactions',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'english',
    name: 'English',
    icon: '📚',
    progress: 85,
    totalLessons: 15,
    completedLessons: 13,
    nextLesson: 'Creative Writing',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'history',
    name: 'History',
    icon: '🏛️',
    progress: 45,
    totalLessons: 12,
    completedLessons: 5,
    nextLesson: 'Ancient Civilizations',
    color: 'bg-orange-100 text-orange-700'
  }
];

const mockBadges = [
  { id: 1, name: 'First Quiz Master', icon: '🏆', earned: true, description: 'Complete your first quiz' },
  { id: 2, name: 'Speed Learner', icon: '⚡', earned: true, description: 'Complete 5 quizzes in a day' },
  { id: 3, name: 'Perfect Score', icon: '🌟', earned: true, description: 'Get 100% on a quiz' },
  { id: 4, name: 'Study Streak', icon: '🔥', earned: false, description: 'Study for 7 days straight' },
  { id: 5, name: 'Helper', icon: '🤝', earned: false, description: 'Help 5 classmates' },
  { id: 6, name: 'Explorer', icon: '🗺️', earned: false, description: 'Complete all subjects' }
];

const mockLeaderboard = [
  { id: 1, name: 'Sarah Chen', points: 2450, avatar: null, rank: 1, isCurrentUser: false },
  { id: 2, name: 'You', points: 2380, avatar: null, rank: 2, isCurrentUser: true },
  { id: 3, name: 'Mike Johnson', points: 2210, avatar: null, rank: 3, isCurrentUser: false },
  { id: 4, name: 'Emma Wilson', points: 2150, avatar: null, rank: 4, isCurrentUser: false },
  { id: 5, name: 'Alex Kumar', points: 2080, avatar: null, rank: 5, isCurrentUser: false }
];

const mockQuizzes = [
  {
    id: 'quiz-1',
    title: 'Basic Algebra',
    subject: 'Mathematics',
    difficulty: 'Easy',
    questions: 10,
    timeLimit: 15,
    points: 100,
    completed: false
  },
  {
    id: 'quiz-2',
    title: 'Photosynthesis',
    subject: 'Science',
    difficulty: 'Medium',
    questions: 8,
    timeLimit: 12,
    points: 120,
    completed: false
  },
  {
    id: 'quiz3',
    title: 'Grammar Rules',
    subject: 'English',
    difficulty: 'Easy',
    questions: 12,
    timeLimit: 10,
    points: 80,
    completed: true
  }
];

export function StudentDashboard({ user, onStartQuiz, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 2380,
    totalXP: 500,
    streak: 5,
    completedQuizzes: 23,
    averageScore: 87
  });
  const [availableQuizzes, setAvailableQuizzes] = useState(mockQuizzes);
  const [levelInfo, setLevelInfo] = useState(calculateLevel(500));
  const [showGames, setShowGames] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const result = await localClient.getLeaderboard(accessToken);
      
      if (result.leaderboard) {
        setLeaderboard(result.leaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      // Get updated profile
      const profileResult = await localClient.getProfile(accessToken);
      if (profileResult.user) {
        const newStats = {
          totalPoints: profileResult.user.points || 0,
          totalXP: profileResult.user.totalXP || 500,
          streak: profileResult.user.streak || 0,
          completedQuizzes: profileResult.user.completedQuizzes || 0,
          averageScore: profileResult.user.averageScore || 0
        };
        setUserStats(newStats);
        setLevelInfo(calculateLevel(newStats.totalXP));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleXPEarned = async (xpAmount: number) => {
    const result = awardXP(userStats.totalXP, xpAmount);
    
    const newStats = {
      ...userStats,
      totalXP: result.newTotalXP,
      totalPoints: userStats.totalPoints + xpAmount
    };
    
    setUserStats(newStats);
    setLevelInfo(result.levelInfo);
    
    // Save to localStorage
    localStorage.setItem('userStats', JSON.stringify(newStats));
    
    // Show level up notification
    if (result.leveledUp) {
      toast.success(`🎉 Level Up! You reached ${result.levelInfo.title} (Level ${result.levelInfo.level})!`, {
        duration: 6000
      });
    }
    
    // Update user profile in storage
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await localClient.updateProfile(accessToken, {
          totalXP: result.newTotalXP,
          points: newStats.totalPoints
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const loadQuizzes = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const result = await localClient.getQuizzes(accessToken);
      if (result.quizzes) {
        // Convert to expected format for display
        const formattedQuizzes = result.quizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          questions: quiz.questions.length,
          timeLimit: Math.round(quiz.timeLimit / 60), // Convert to minutes
          points: quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0),
          completed: false // TODO: Check if user has completed this quiz
        }));
        setAvailableQuizzes(formattedQuizzes);
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    }
  };

  useEffect(() => {
    // Load user stats from localStorage initially
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setUserStats(stats);
      setLevelInfo(calculateLevel(stats.totalXP || 500));
    }
    
    // Award daily login XP
    const lastLogin = localStorage.getItem('lastLogin');
    const today = new Date().toDateString();
    if (lastLogin !== today) {
      localStorage.setItem('lastLogin', today);
      setTimeout(() => {
        handleXPEarned(XP_REWARDS.DAILY_LOGIN);
        toast.info(`Daily login bonus: +${XP_REWARDS.DAILY_LOGIN} XP! 🌟`);
      }, 1000);
    }
    
    // Load real-time data from local storage
    loadUserData();
    loadQuizzes();
    
    // Load leaderboard when viewing that tab
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  if (showGames) {
    return (
      <Games 
        user={user}
        onBack={() => setShowGames(false)}
        onXPEarned={handleXPEarned}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold">Welcome back, {user.name}!</h1>
                <p className="text-sm text-gray-600">{user.school} • Grade {user.grade}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Level Progress Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Crown className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{levelInfo.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{levelInfo.title}</h3>
                    <p className="text-white/80">Level {levelInfo.level}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{levelInfo.currentXP} XP</span>
                    <span>{levelInfo.currentXP + levelInfo.xpToNext} XP</span>
                  </div>
                  <Progress 
                    value={getLevelProgress(levelInfo)} 
                    className="h-3 bg-white/20"
                  />
                  <p className="text-white/80 text-sm">
                    {levelInfo.xpToNext} XP to next level
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{userStats.totalPoints}</p>
              <p className="text-xs text-gray-600">Points</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">{userStats.totalXP}</p>
              <p className="text-xs text-gray-600">Total XP</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-red-100 p-2 rounded-full">
                  <Zap className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">{userStats.streak}</p>
              <p className="text-xs text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{userStats.completedQuizzes}</p>
              <p className="text-xs text-gray-600">Quizzes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{userStats.averageScore}%</p>
              <p className="text-xs text-gray-600">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'subjects', label: 'Subjects', icon: Brain },
            { id: 'quizzes', label: 'Quizzes', icon: Target },
            { id: 'games', label: 'Games', icon: Gamepad2 },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'achievements', label: 'Badges', icon: Award },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => tab.id === 'games' ? setShowGames(true) : setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Your Learning Journey</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSubjects.slice(0, 2).map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${subject.color}`}>
                        <span className="text-lg">{subject.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">{subject.name}</h4>
                          <span className="text-sm text-gray-600">{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">Next: {subject.nextLesson}</p>
                      </div>
                      <Button size="sm">
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockBadges.filter(b => b.earned).slice(0, 3).map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <p className="font-medium text-yellow-800">{badge.name}</p>
                          <p className="text-xs text-yellow-700">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump into activities and earn XP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowGames(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Learning Games
                    <Badge variant="secondary" className="ml-auto">
                      +30 XP
                    </Badge>
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('quizzes')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Take a Quiz
                    <Badge variant="secondary" className="ml-auto">
                      +50 XP
                    </Badge>
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('progress')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                    <Badge variant="secondary" className="ml-auto">
                      Track Goals
                    </Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid md:grid-cols-2 gap-6">
            {mockSubjects.map((subject) => (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${subject.color}`}>
                      <span className="text-xl">{subject.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription>
                        {subject.completedLessons}/{subject.totalLessons} lessons completed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Next lesson:</strong> {subject.nextLesson}
                    </p>
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Quizzes</CardTitle>
                <CardDescription>Test your knowledge and earn points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{quiz.title}</h4>
                          <Badge variant={quiz.difficulty === 'Easy' ? 'secondary' : quiz.difficulty === 'Medium' ? 'default' : 'destructive'}>
                            {quiz.difficulty}
                          </Badge>
                          {quiz.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-600">{quiz.subject}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{quiz.questions} questions</span>
                          <span><Clock className="w-3 h-3 inline mr-1" />{quiz.timeLimit} min</span>
                          <span><Star className="w-3 h-3 inline mr-1" />{quiz.points} pts</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => onStartQuiz(quiz.id)}
                        disabled={quiz.completed}
                        variant={quiz.completed ? 'secondary' : 'default'}
                      >
                        {quiz.completed ? 'Completed' : 'Start Quiz'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
                <CardDescription>Collect badges by completing challenges and reaching milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mockBadges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className={`p-4 rounded-lg border text-center transition-all ${
                        badge.earned 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-3xl mb-2">{badge.earned ? badge.icon : '🔒'}</div>
                      <h4 className="font-medium mb-1">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                      {badge.earned && (
                        <Badge className="mt-2" variant="secondary">Earned</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'progress' && (
          <ProgressTracker 
            levelInfo={levelInfo}
            userStats={userStats}
          />
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Leaderboard</CardTitle>
                <CardDescription>See how you rank against your classmates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((student) => (
                    <div 
                      key={student.id} 
                      className={`flex items-center space-x-4 p-3 rounded-lg ${
                        student.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        student.rank === 1 ? 'bg-yellow-500 text-white' :
                        student.rank === 2 ? 'bg-gray-400 text-white' :
                        student.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {student.rank}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.points} points</p>
                      </div>
                      {student.rank <= 3 && (
                        <Trophy className={`w-5 h-5 ${
                          student.rank === 1 ? 'text-yellow-500' :
                          student.rank === 2 ? 'text-gray-400' :
                          'text-orange-500'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}