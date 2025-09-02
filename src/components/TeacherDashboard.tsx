import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star, 
  Plus,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Award,
  Target
} from 'lucide-react';

interface TeacherDashboardProps {
  user: any;
  onLogout: () => void;
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
}

// Mock data
const mockClasses = [
  {
    id: 'class1',
    name: 'Grade 8A',
    subject: 'Mathematics',
    students: 25,
    averageScore: 87,
    activeQuizzes: 3,
    completedQuizzes: 15
  },
  {
    id: 'class2',
    name: 'Grade 8B',
    subject: 'Science',
    students: 23,
    averageScore: 82,
    activeQuizzes: 2,
    completedQuizzes: 12
  }
];

const mockStudents = [
  {
    id: 1,
    name: 'Gutam Nayak',
    class: 'Grade 8A',
    averageScore: 95,
    completedQuizzes: 18,
    lastActive: '2 hours ago',
    status: 'active',
    progress: 85
  },
  {
    id: 2,
    name: 'saheb Raut',
    class: 'Grade 8A',
    averageScore: 78,
    completedQuizzes: 15,
    lastActive: '1 day ago',
    status: 'active',
    progress: 72
  },
  {
    id: 3,
    name: 'uttam Rout',
    class: 'Grade 8B',
    averageScore: 88,
    completedQuizzes: 14,
    lastActive: '3 hours ago',
    status: 'active',
    progress: 80
  },
  {
    id: 4,
    name: 'debgopal Raut',
    class: 'Grade 8B',
    averageScore: 72,
    completedQuizzes: 10,
    lastActive: '3 days ago',
    status: 'needs_attention',
    progress: 65
  }
];

const mockQuizzes = [
  {
    id: 'quiz1',
    title: 'Tapan Maity',
    subject: 'Mathematics',
    class: 'Grade 8A',
    questions: 10,
    timeLimit: 15,
    status: 'active',
    completions: 18,
    averageScore: 85,
    createdAt: '2024-01-15'
  },
  {
    id: 'quiz2',
    title: 'Photosynthesis',
    subject: 'Science',
    class: 'Grade 8B',
    questions: 8,
    timeLimit: 12,
    status: 'draft',
    completions: 0,
    averageScore: 0,
    createdAt: '2024-01-16'
  },
  {
    id: 'quiz3',
    title: 'Geometry Basics',
    subject: 'Mathematics',
    class: 'Grade 8A',
    questions: 12,
    timeLimit: 20,
    status: 'completed',
    completions: 25,
    averageScore: 78,
    createdAt: '2024-01-10'
  }
];

export function TeacherDashboard({ user, onLogout, onCreateQuiz, onEditQuiz }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const totalStudents = mockClasses.reduce((sum, cls) => sum + cls.students, 0);
  const averageClassScore = Math.round(mockClasses.reduce((sum, cls) => sum + cls.averageScore, 0) / mockClasses.length);
  const totalQuizzes = mockQuizzes.length;
  const activeQuizzes = mockQuizzes.filter(quiz => quiz.status === 'active').length;

  return (
    <div 
  className="min-h-screen" 
  style={{
    backgroundColor: 'lightblue',//background color change hare
    color: 'white' // 
  }}
>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold">Welcome, {user.name}</h1>
                <p className="text-sm text-gray-600">{user.school} • Teacher Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              <p className="text-xs text-gray-600">Total Students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{averageClassScore}%</p>
              <p className="text-xs text-gray-600">Avg Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">{activeQuizzes}</p>
              <p className="text-xs text-gray-600">Active Quizzes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-orange-100 p-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-600">{totalQuizzes}</p>
              <p className="text-xs text-gray-600">Total Quizzes</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'classes', label: 'Classes', icon: Users },
            { id: 'students', label: 'Students', icon: BookOpen },
            { id: 'quizzes', label: 'Quizzes', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Dip Rout completed "Basic Algebra" quiz</p>
                      <p className="text-xs text-gray-600">Grade 8A • 2 hours ago • Score: 95%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">New achievement earned by Abhishek Giri</p>
                      <p className="text-xs text-gray-600">Grade 8A • 3 hours ago • "Speed Learner" badge</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Bubai Raut needs attention</p>
                      <p className="text-xs text-gray-600">Grade 8B • No activity for 3 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <div className="grid md:grid-cols-2 gap-6">
              {mockClasses.map((cls) => (
                <Card key={cls.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <CardDescription>{cls.subject}</CardDescription>
                      </div>
                      <Badge variant="secondary">{cls.students} students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{cls.averageScore}%</p>
                        <p className="text-xs text-gray-600">Average Score</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{cls.completedQuizzes}</p>
                        <p className="text-xs text-gray-600">Completed Quizzes</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Class Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Classes</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {mockClasses.map((cls) => (
                <Card key={cls.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cls.name}</CardTitle>
                        <CardDescription>{cls.subject}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">{cls.students}</p>
                        <p className="text-xs text-gray-600">Students</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{cls.averageScore}%</p>
                        <p className="text-xs text-gray-600">Avg Score</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600">{cls.activeQuizzes}</p>
                        <p className="text-xs text-gray-600">Active Quizzes</p>
                      </div>
                    </div>
                    <Button className="w-full">Manage Class</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>Monitor your students' progress and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.class}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{student.averageScore}%</p>
                          <p className="text-gray-600">Avg Score</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{student.completedQuizzes}</p>
                          <p className="text-gray-600">Quizzes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Last active</p>
                          <p className="text-xs">{student.lastActive}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {student.status === 'needs_attention' && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quiz Management</h2>
              <Button onClick={onCreateQuiz}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>

            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {mockQuizzes.map((quiz, index) => (
                    <div key={quiz.id} className={`p-4 ${index !== mockQuizzes.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{quiz.title}</h4>
                            <Badge 
                              variant={
                                quiz.status === 'active' ? 'default' :
                                quiz.status === 'draft' ? 'secondary' : 'outline'
                              }
                            >
                              {quiz.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{quiz.subject} • {quiz.class}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{quiz.questions} questions</span>
                            <span><Clock className="w-3 h-3 inline mr-1" />{quiz.timeLimit} min</span>
                            <span>{quiz.completions} completions</span>
                            {quiz.averageScore > 0 && (
                              <span><Star className="w-3 h-3 inline mr-1" />{quiz.averageScore}% avg</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onEditQuiz(quiz.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
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