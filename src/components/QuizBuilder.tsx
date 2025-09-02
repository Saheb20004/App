import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  BookOpen, 
  Clock, 
  Target,
  CheckCircle,
  AlertCircle,
  Star,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface QuizBuilderProps {
  user: any;
  onBack: () => void;
  editQuizId?: string | null;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface QuizData {
  title: string;
  subject: string;
  description: string;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  questions: Question[];
}

export function QuizBuilder({ user, onBack, editQuizId }: QuizBuilderProps) {
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'review'>('basic');
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    subject: '',
    description: '',
    timeLimit: 15,
    difficulty: 'medium',
    instructions: 'Read each question carefully and select the best answer. You have one attempt per question.',
    questions: []
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If editing an existing quiz, load its data
    if (editQuizId) {
      // Here you would normally fetch from your backend
      console.log('Loading quiz for editing:', editQuizId);
    }
  }, [editQuizId]);

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10
    };
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setCurrentQuestionIndex(quizData.questions.length);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, oi) => oi === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    if (quizData.questions.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    if (currentQuestionIndex >= quizData.questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, quizData.questions.length - 2));
    }
  };

  const validateBasicInfo = (): boolean => {
    if (!quizData.title.trim()) {
      toast.error('Please enter a quiz title');
      return false;
    }
    if (!quizData.subject.trim()) {
      toast.error('Please select a subject');
      return false;
    }
    if (quizData.timeLimit < 1) {
      toast.error('Time limit must be at least 1 minute');
      return false;
    }
    return true;
  };

  const validateQuestions = (): boolean => {
    if (quizData.questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return false;
      }
      
      const filledOptions = question.options.filter(opt => opt.trim().length > 0);
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 answer options`);
        return false;
      }
      
      if (!question.options[question.correctAnswer]?.trim()) {
        toast.error(`Question ${i + 1} has an invalid correct answer selection`);
        return false;
      }
    }
    
    return true;
  };

  const handleSaveQuiz = async (publish: boolean = false) => {
    if (!validateBasicInfo() || !validateQuestions()) {
      return;
    }

    setIsSaving(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const { apiClient } = await import('../utils/supabase/client');
        
        const quizPayload = {
          ...quizData,
          status: publish ? 'published' : 'draft',
          teacherId: user.id,
          createdAt: new Date().toISOString()
        };
        
        if (editQuizId) {
          await apiClient.updateQuiz(accessToken, editQuizId, quizPayload);
          toast.success(`Quiz ${publish ? 'published' : 'saved as draft'} successfully!`);
        } else {
          await apiClient.createQuiz(accessToken, quizPayload);
          toast.success(`Quiz ${publish ? 'published' : 'saved as draft'} successfully!`);
        }
      }
      
      // Redirect back to teacher dashboard
      setTimeout(() => {
        onBack();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);

  if (isPreviewMode && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Preview Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
            <Badge variant="secondary">Preview Mode</Badge>
          </div>

          {/* Quiz Preview */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{quizData.title}</CardTitle>
                  <CardDescription>Question {currentQuestionIndex + 1} of {quizData.questions.length}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{quizData.timeLimit} minutes</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">{currentQuestion.points} points</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                option.trim() && (
                  <div
                    key={index}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {index === currentQuestion.correctAnswer && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                )
              ))}
              
              {currentQuestion.explanation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.min(quizData.questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === quizData.questions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {editQuizId ? 'Edit Quiz' : 'Create New Quiz'}
                </h1>
                <p className="text-sm text-gray-600">Build an engaging quiz for your students</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {quizData.questions.length > 0 && (
                <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button 
                onClick={() => handleSaveQuiz(false)}
                disabled={isSaving}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={() => handleSaveQuiz(true)}
                disabled={isSaving}
              >
                {isSaving ? 'Publishing...' : 'Publish Quiz'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Step Navigation */}
        <div className="flex items-center space-x-4 mb-6">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'questions', label: 'Questions', icon: BookOpen },
            { id: 'review', label: 'Review', icon: CheckCircle }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span>{step.label}</span>
              </button>
              {index < 2 && (
                <div className="w-8 h-px bg-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'basic' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
                <CardDescription>Basic details about your quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quiz title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select onValueChange={(value) => setQuizData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizData.description}
                    onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the quiz"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quiz Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
                <CardDescription>Configure quiz parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes) *</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                
                <div>
                  <Label>Difficulty Level</Label>
                  <Select onValueChange={(value) => setQuizData(prev => ({ ...prev, difficulty: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="instructions">Instructions for Students</Label>
                  <Textarea
                    id="instructions"
                    value={quizData.instructions}
                    onChange={(e) => setQuizData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => setCurrentStep('questions')}
                    className="w-full"
                    disabled={!validateBasicInfo()}
                  >
                    Continue to Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'questions' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Question List Sidebar */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Questions ({quizData.questions.length})</CardTitle>
                  <Button size="sm" onClick={addNewQuestion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>Total Points: {totalPoints}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {quizData.questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full p-3 text-left border-b transition-colors ${
                        currentQuestionIndex === index
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Question {index + 1}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {question.question || 'Untitled Question'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <span className="text-xs text-gray-500">{question.points}pts</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {quizData.questions.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No questions yet</p>
                      <Button size="sm" onClick={addNewQuestion} className="mt-2">
                        Add First Question
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Editor */}
            <div className="lg:col-span-2">
              {currentQuestion ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                        <CardDescription>Build your question and answer options</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeQuestion(currentQuestionIndex)}
                        disabled={quizData.questions.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div>
                      <Label htmlFor="question-text">Question Text *</Label>
                      <Textarea
                        id="question-text"
                        value={currentQuestion.question}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        rows={3}
                      />
                    </div>

                    {/* Answer Options */}
                    <div>
                      <Label>Answer Options *</Label>
                      <div className="space-y-3 mt-2">
                        {currentQuestion.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <RadioGroup
                              value={currentQuestion.correctAnswer.toString()}
                              onValueChange={(value) => updateQuestion(currentQuestionIndex, 'correctAnswer', parseInt(value))}
                            >
                              <RadioGroupItem value={optionIndex.toString()} />
                            </RadioGroup>
                            <Input
                              value={option}
                              onChange={(e) => updateQuestionOption(currentQuestionIndex, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className={currentQuestion.correctAnswer === optionIndex ? 'border-green-500' : ''}
                            />
                            {currentQuestion.correctAnswer === optionIndex && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Select the radio button next to the correct answer
                      </p>
                    </div>

                    <Separator />

                    {/* Points and Explanation */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          min="1"
                          max="100"
                          value={currentQuestion.points}
                          onChange={(e) => updateQuestion(currentQuestionIndex, 'points', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="explanation">Explanation (Optional)</Label>
                      <Textarea
                        id="explanation"
                        value={currentQuestion.explanation}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'explanation', e.target.value)}
                        placeholder="Explain why this is the correct answer..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Add Question" to create your first question</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            {/* Quiz Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Summary</CardTitle>
                <CardDescription>Review your quiz before publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-600">{quizData.questions.length}</p>
                    <p className="text-xs text-gray-600">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Target className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-600">{totalPoints}</p>
                    <p className="text-xs text-gray-600">Total Points</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-orange-600">{quizData.timeLimit}</p>
                    <p className="text-xs text-gray-600">Minutes</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Star className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-600">{quizData.difficulty}</p>
                    <p className="text-xs text-gray-600">Difficulty</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Quiz Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {quizData.title}</p>
                      <p><strong>Subject:</strong> {quizData.subject}</p>
                      {quizData.description && (
                        <p><strong>Description:</strong> {quizData.description}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <p className="text-sm text-gray-600">{quizData.instructions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validateBasicInfo() ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Basic information is complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Basic information needs attention</span>
                    </div>
                  )}
                  
                  {validateQuestions() ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">All questions are properly configured</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Some questions need attention</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('questions')}>
                Back to Questions
              </Button>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => handleSaveQuiz(false)}
                  disabled={isSaving}
                >
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => handleSaveQuiz(true)}
                  disabled={isSaving || !validateBasicInfo() || !validateQuestions()}
                >
                  {isSaving ? 'Publishing...' : 'Publish Quiz'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}