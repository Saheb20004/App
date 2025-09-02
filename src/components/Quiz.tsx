import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Clock, 
  CheckCircle, 
  X, 
  ArrowLeft, 
  ArrowRight,
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { localClient } from '../utils/local/storage';

interface QuizProps {
  quizId: string;
  user: any;
  onComplete: (score: number, results: any) => void;
  onExit: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

// Mock quiz data
const mockQuizData: { [key: string]: { title: string; timeLimit: number; questions: Question[] } } = {
  'quiz-1': {
    title: 'Basic Mathematics',
    timeLimit: 10 * 60, // 10 minutes in seconds
    questions: [
      {
        id: 'q1',
        question: 'What is 15 + 23?',
        options: ['35', '38', '40', '42'],
        correctAnswer: 1,
        explanation: '15 + 23 = 38',
        points: 10
      },
      {
        id: 'q2',
        question: 'What is 8 × 7?',
        options: ['54', '56', '58', '60'],
        correctAnswer: 1,
        explanation: '8 × 7 = 56',
        points: 10
      },
      {
        id: 'q3',
        question: 'What is 144 ÷ 12?',
        options: ['10', '11', '12', '13'],
        correctAnswer: 2,
        explanation: '144 ÷ 12 = 12',
        points: 10
      }
    ]
  },
  'quiz-2': {
    title: 'Science Fundamentals',
    timeLimit: 15 * 60,
    questions: [
      {
        id: 'q1',
        question: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 0,
        explanation: 'Water is H2O (two hydrogen atoms and one oxygen atom)',
        points: 15
      },
      {
        id: 'q2',
        question: 'What force keeps planets in orbit around the sun?',
        options: ['Magnetism', 'Gravity', 'Friction', 'Centrifugal force'],
        correctAnswer: 1,
        explanation: 'Gravity is the force that keeps planets in orbit around the sun',
        points: 15
      }
    ]
  }
};

export function Quiz({ quizId, user, onComplete, onExit }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showIncorrectAnimation, setShowIncorrectAnimation] = useState(false);
  const [justAnswered, setJustAnswered] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const totalQuestions = quizData?.questions.length || 0;
  
  // Load quiz data from local storage
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const result = await localClient.getQuiz(accessToken, quizId);
          if (result.quiz) {
            setQuizData(result.quiz);
            setTimeRemaining(result.quiz.timeLimit);
          }
        }
      } catch (error) {
        console.error('Failed to load quiz:', error);
        // Fallback to mock data
        const mockData = mockQuizData[quizId];
        if (mockData) {
          setQuizData(mockData);
          setTimeRemaining(mockData.timeLimit);
        }
      }
    };
    
    loadQuizData();
  }, [quizId]);

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    const totalTime = quizData?.timeLimit || 900;
    const percentage = (seconds / totalTime) * 100;
    
    if (percentage <= 10) return 'text-red-600';
    if (percentage <= 25) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getTimeProgress = (seconds: number) => {
    const totalTime = quizData?.timeLimit || 900;
    return ((totalTime - seconds) / totalTime) * 100;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!isSubmitted && !justAnswered) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionIndex
      }));
      
      // Show immediate feedback animation
      setJustAnswered(true);
      if (optionIndex === currentQuestion.correctAnswer) {
        setShowCorrectAnimation(true);
        setTimeout(() => setShowCorrectAnimation(false), 1500);
      } else {
        setShowIncorrectAnimation(true);
        setTimeout(() => setShowIncorrectAnimation(false), 1500);
      }
      
      // Reset after animation
      setTimeout(() => setJustAnswered(false), 1000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setJustAnswered(false);
      setShowCorrectAnimation(false);
      setShowIncorrectAnimation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setJustAnswered(false);
      setShowCorrectAnimation(false);
      setShowIncorrectAnimation(false);
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let totalPoints = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    quizData.questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
        totalPoints += question.points;
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    return { correctAnswers, scorePercentage, totalPoints, longestStreak };
  };

  const handleSubmitQuiz = async () => {
    const results = calculateResults();
    setScore(results.scorePercentage);
    setEarnedPoints(results.totalPoints);
    setMaxStreak(results.longestStreak);
    setIsSubmitted(true);
    setShowResults(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // Submit to local storage
        await localClient.submitQuiz(accessToken, quizId, {
          answers: selectedAnswers,
          score: results.scorePercentage,
          timeSpent: quizData.timeLimit - timeRemaining,
          earnedPoints: results.totalPoints
        });
        
        // Update user progress
        await localClient.updateProgress(accessToken, {
          points: results.totalPoints,
          quiz_score: results.scorePercentage,
          quiz_id: quizId,
          subject: quizData.title
        });
        
        console.log('Quiz submitted successfully');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
    
    // Update user stats in localStorage as fallback
    const currentStats = JSON.parse(localStorage.getItem('userStats') || '{}');
    const updatedStats = {
      ...currentStats,
      totalPoints: (currentStats.totalPoints || 0) + results.totalPoints,
      completedQuizzes: (currentStats.completedQuizzes || 0) + 1,
      averageScore: Math.round(((currentStats.averageScore || 0) * (currentStats.completedQuizzes || 0) + results.scorePercentage) / ((currentStats.completedQuizzes || 0) + 1))
    };
    localStorage.setItem('userStats', JSON.stringify(updatedStats));
    
    onComplete(results.scorePercentage, results);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding! 🌟", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (score >= 80) return { message: "Great job! 🎉", color: "text-green-600", bgColor: "bg-green-100" };
    if (score >= 70) return { message: "Good work! 👍", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (score >= 60) return { message: "Keep improving! 📚", color: "text-orange-600", bgColor: "bg-orange-100" };
    return { message: "Keep practicing! 💪", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const getBadgeEarned = (score: number, streak: number) => {
    if (score === 100) return { name: "Perfect Score!", icon: "🌟" };
    if (score >= 90) return { name: "Excellence!", icon: "🏆" };
    if (streak >= 3) return { name: "Streak Master!", icon: "🔥" };
    if (score >= 80) return { name: "Great Job!", icon: "⭐" };
    return null;
  };

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p>Quiz not found</p>
            <Button onClick={onExit} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const scoreMessage = getScoreMessage(score);
    const badge = getBadgeEarned(score, maxStreak);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${scoreMessage.bgColor}`}>
                <Trophy className={`w-8 h-8 ${scoreMessage.color}`} />
              </div>
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription className={scoreMessage.color}>
              {scoreMessage.message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-gray-600">Your Score</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-600">{earnedPoints}</p>
                <p className="text-xs text-gray-600">Points Earned</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">
                  {Math.round((score / 100) * totalQuestions)}/{totalQuestions}
                </p>
                <p className="text-xs text-gray-600">Correct</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-orange-600">{maxStreak}</p>
                <p className="text-xs text-gray-600">Best Streak</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-600">
                  {formatTime(quizData.timeLimit - timeRemaining)}
                </p>
                <p className="text-xs text-gray-600">Time Used</p>
              </div>
            </div>

            {/* Badge Earned */}
            {badge && (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-medium text-yellow-800">Badge Earned: {badge.name}</p>
              </div>
            )}

            {/* Question Review */}
            <div className="space-y-3">
              <h3 className="font-medium">Question Review:</h3>
              {quizData.questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Q{index + 1}: {question.question}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Your answer: {question.options[userAnswer] || 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-green-700 mt-1">
                            Correct: {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button onClick={onExit} className="flex-1">
                Back to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                  setTimeRemaining(quizData.timeLimit);
                  setIsSubmitted(false);
                  setShowResults(false);
                }}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Quiz
          </Button>
          
          <div className="flex items-center space-x-4">
            {/* Enhanced Timer Display */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className={timeRemaining < 300 ? 'text-red-500' : timeRemaining < 600 ? 'text-orange-500' : 'text-green-500'}
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getTimeProgress(timeRemaining) / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getTimeColor(timeRemaining)}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-xs text-gray-500">Time Left</p>
              </div>
            </div>
            
            {/* Current Score Display */}
            <div className="text-center px-4 py-2 bg-white rounded-lg border">
              <div className="text-lg font-bold text-primary">
                {answeredQuestions > 0 ? Math.round((Object.values(selectedAnswers).filter((answer, index) => 
                  answer === quizData.questions[Object.keys(selectedAnswers).findIndex(id => quizData.questions[index]?.id === id)]?.correctAnswer
                ).length / answeredQuestions) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500">Current Score</p>
            </div>
          </div>
        </div>

        {/* Quiz Info Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{quizData.title}</CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  {answeredQuestions}/{totalQuestions} answered
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className={`mb-6 transition-all duration-300 ${
          showCorrectAnimation ? 'border-green-500 shadow-green-200 shadow-lg' :
          showIncorrectAnimation ? 'border-red-500 shadow-red-200 shadow-lg' : ''
        }`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {currentQuestion?.question}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{currentQuestion?.points} points</span>
                </div>
              </div>
              
              {/* Instant feedback animations */}
              {showCorrectAnimation && (
                <div className="flex items-center space-x-2 text-green-600 animate-pulse">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Correct! +{currentQuestion?.points} pts</span>
                </div>
              )}
              
              {showIncorrectAnimation && (
                <div className="flex items-center space-x-2 text-red-600 animate-pulse">
                  <X className="w-6 h-6" />
                  <span className="font-medium">Try again!</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showFeedback = justAnswered && isSelected;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={justAnswered}
                  className={`w-full p-4 text-left rounded-lg border transition-all transform hover:scale-[1.02] ${
                    isSelected
                      ? showFeedback && isCorrect
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                        : showFeedback && !isCorrect
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                        : 'border-primary bg-primary/10 text-primary shadow-md'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50 hover:shadow-sm'
                  } ${justAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? showFeedback && isCorrect
                          ? 'border-green-500 bg-green-500 text-white scale-110'
                          : showFeedback && !isCorrect
                          ? 'border-red-500 bg-red-500 text-white scale-110'
                          : 'border-primary bg-primary text-white scale-110'
                        : 'border-gray-300 hover:border-primary/50'
                    }`}>
                      {isSelected ? (
                        showFeedback && isCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : showFeedback && !isCorrect ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-gray-400">{String.fromCharCode(65 + index)}</span>
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                    {isSelected && !justAnswered && (
                      <div className="flex items-center space-x-1 text-primary">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-medium">Selected</span>
                      </div>
                    )}
                    {showFeedback && isSelected && isCorrect && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-xs font-medium">+{currentQuestion.points}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-white'
                    : selectedAnswers[quizData.questions[index].id] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={answeredQuestions < totalQuestions}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
              <Trophy className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Warning for unanswered questions */}
        {answeredQuestions < totalQuestions && currentQuestionIndex === totalQuestions - 1 && (
          <Card className="mt-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">
                  You have {totalQuestions - answeredQuestions} unanswered question(s). 
                  Please complete all questions before submitting.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}