import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Star, 
  Target, 
  Zap, 
  Trophy, 
  Book, 
  Brain,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';
import { LevelInfo } from '../utils/leveling';

interface ProgressTrackerProps {
  levelInfo: LevelInfo;
  userStats: {
    totalPoints: number;
    totalXP: number;
    streak: number;
    completedQuizzes: number;
    averageScore: number;
  };
}

const achievements = [
  {
    id: 'first-level',
    title: 'Getting Started',
    description: 'Reach Level 2',
    icon: '🌟',
    requirement: 2,
    type: 'level',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🎯',
    requirement: 10,
    type: 'quizzes',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'streak-warrior',
    title: 'Streak Warrior',
    description: 'Maintain 7-day streak',
    icon: '🔥',
    requirement: 7,
    type: 'streak',
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Average 90% score',
    icon: '⭐',
    requirement: 90,
    type: 'averageScore',
    color: 'bg-yellow-100 text-yellow-700'
  },
  {
    id: 'xp-collector',
    title: 'XP Collector',
    description: 'Earn 1000 XP',
    icon: '💎',
    requirement: 1000,
    type: 'totalXP',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Reach Level 5',
    icon: '🎓',
    requirement: 5,
    type: 'level',
    color: 'bg-indigo-100 text-indigo-700'
  }
];

export function ProgressTracker({ levelInfo, userStats }: ProgressTrackerProps) {
  const checkAchievement = (achievement: typeof achievements[0]) => {
    const currentValue = achievement.type === 'level' 
      ? levelInfo.level 
      : userStats[achievement.type as keyof typeof userStats];
    
    return currentValue >= achievement.requirement;
  };

  const getProgress = (achievement: typeof achievements[0]) => {
    const currentValue = achievement.type === 'level' 
      ? levelInfo.level 
      : userStats[achievement.type as keyof typeof userStats];
    
    return Math.min(100, Math.round((currentValue / achievement.requirement) * 100));
  };

  const upcomingMilestones = [
    {
      title: 'Next Level',
      description: `${levelInfo.xpToNext} XP needed`,
      progress: Math.round((levelInfo.currentXP / levelInfo.totalXPForLevel) * 100),
      icon: <Star className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-100'
    },
    {
      title: 'Quiz Goal',
      description: `${Math.max(0, 25 - userStats.completedQuizzes)} quizzes to go`,
      progress: Math.min(100, Math.round((userStats.completedQuizzes / 25) * 100)),
      icon: <Target className="w-5 h-5 text-green-600" />,
      color: 'bg-green-100'
    },
    {
      title: 'XP Milestone',
      description: `${Math.max(0, 2000 - userStats.totalXP)} XP to 2000`,
      progress: Math.min(100, Math.round((userStats.totalXP / 2000) * 100)),
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      color: 'bg-yellow-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span>Level Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-3xl">{levelInfo.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{levelInfo.title}</h3>
              <p className="text-gray-600">Level {levelInfo.level}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{levelInfo.currentXP} XP</p>
              <p className="text-sm text-gray-600">of {levelInfo.totalXPForLevel}</p>
            </div>
          </div>
          <Progress value={Math.round((levelInfo.currentXP / levelInfo.totalXPForLevel) * 100)} className="h-3" />
          <p className="text-sm text-gray-600 mt-2">
            {levelInfo.xpToNext} XP needed for next level
          </p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isCompleted = checkAchievement(achievement);
              const progress = getProgress(achievement);
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${achievement.color}`}>
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  {!isCompleted && (
                    <div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <p className="text-xs text-gray-500">
                        {progress}% complete
                      </p>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <Badge className="w-full justify-center" variant="secondary">
                      Completed! 🎉
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Upcoming Milestones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${milestone.color}`}>
                  {milestone.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <span className="text-sm text-gray-600">{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2 mb-1" />
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}