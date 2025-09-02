import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BookOpen, Users, Award, Globe } from 'lucide-react';
import { localClient } from '../utils/local/storage';

interface AuthPageProps {
  onLogin: (userType: 'student' | 'teacher', userData: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  
  // Clear local storage and reinitialize if needed
  const clearAndReinitialize = () => {
    localStorage.clear();
    // Reload page to reinitialize everything
    window.location.reload();
  };
  
  // Demo login function
  const handleDemoLogin = async (userType: 'student' | 'teacher') => {
    setIsLoading(true);
    
    try {
      const email = userType === 'student' ? 'student@gmail.com' : 'teacher@gmail.com';
      const password = '1234';
      

      
      // Sign in with local client
      const authResult = await localClient.signin(email, password);
      
      if (authResult.session?.access_token) {
        // Get user profile from local storage
        const profileResult = await localClient.getProfile(authResult.session.access_token);
        
        const userData = {
          ...profileResult.user,
          accessToken: authResult.session.access_token
        };
        
        // Store session data
        localStorage.setItem('current_session', JSON.stringify({
          session: authResult.session
        }));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', authResult.session.access_token);
        
        onLogin(userType, userData);
      } else {
        throw new Error('Failed to get access token');
      }
      
    } catch (error) {
      console.error('Demo login error:', error);
      alert(`Demo login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>, userType: 'student' | 'teacher') => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      

      
      // Sign in with local client
      const authResult = await localClient.signin(email, password);
      
      if (authResult.session?.access_token) {
        // Get user profile from local storage
        const profileResult = await localClient.getProfile(authResult.session.access_token);
        
        const userData = {
          ...profileResult.user,
          accessToken: authResult.session.access_token
        };
        
        // Store session data
        localStorage.setItem('current_session', JSON.stringify({
          session: authResult.session
        }));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', authResult.session.access_token);
        
        onLogin(userType, userData);
      } else {
        throw new Error('Failed to get access token');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>, userType: 'student' | 'teacher') => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const name = formData.get('name') as string;
      const grade = selectedGrade;
      const school = formData.get('school') as string;
      
      // Sign up with local client
      const signupResult = await localClient.signup({
        email,
        password,
        name,
        userType,
        grade: userType === 'student' ? grade : undefined,
        school
      });
      
      if (signupResult.user) {
        // Automatically sign in after signup
        const authResult = await localClient.signin(email, password);
        
        if (authResult.session?.access_token) {
          const userData = {
            ...signupResult.user,
            accessToken: authResult.session.access_token
          };
          
          // Store session data
          localStorage.setItem('current_session', JSON.stringify({
            session: authResult.session
          }));
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('accessToken', authResult.session.access_token);
          
          onLogin(userType, userData);
        } else {
          throw new Error('Failed to sign in after signup');
        }
      } else {
        throw new Error('Signup failed');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      alert(`Signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
  <div className="flex justify-center">
    {/* logo change here */}
    <img 
      src="/logo.png" 
      alt="My Custom Logo" 
      className="w-12 h-12 " 
    />
  </div>
  <h1 className="text-2xl font-bold text-gray-900">EduQuest</h1>
  <p className="text-gray-600">BY DOJO'S KATANA🧠</p>
</div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-blue-100 p-2 rounded-lg mx-auto w-fit">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Collaborative Learning</p>
          </div>
          <div className="space-y-2">
            <div className="bg-green-100 p-2 rounded-lg mx-auto w-fit">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Earn Badges</p>
          </div>
          <div className="space-y-2">
            <div className="bg-purple-100 p-2 rounded-lg mx-auto w-fit">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Offline Ready</p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <Tabs defaultValue="student" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="student">
                    <form onSubmit={(e) => handleLogin(e, 'student')} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-email">Email</Label>
                        <Input 
                          id="student-email" 
                          name="email" 
                          type="email" 
                          placeholder="student@gamil.com"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-password">Password</Label>
                        <Input 
                          id="student-password" 
                          name="password" 
                          type="password"
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Login as Student'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="teacher">
                    <form onSubmit={(e) => handleLogin(e, 'teacher')} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-email">Email</Label>
                        <Input 
                          id="teacher-email" 
                          name="email" 
                          type="email" 
                          placeholder="teacher@gamil.com"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacher-password">Password</Label>
                        <Input 
                          id="teacher-password" 
                          name="password" 
                          type="password"
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Login as Teacher'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <Tabs defaultValue="student" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="student">
                    <form onSubmit={(e) => handleSignup(e, 'student')} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-signup-name">Full Name</Label>
                        <Input 
                          id="student-signup-name" 
                          name="name" 
                          placeholder="Your full name"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-signup-email">Email</Label>
                        <Input 
                          id="student-signup-email" 
                          name="email" 
                          type="email" 
                          placeholder="student@school.edu"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-grade">Grade</Label>
                        <Select name="grade" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">Grade 6</SelectItem>
                            <SelectItem value="7">Grade 7</SelectItem>
                            <SelectItem value="8">Grade 8</SelectItem>
                            <SelectItem value="9">Grade 9</SelectItem>
                            <SelectItem value="10">Grade 10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-school">School</Label>
                        <Input 
                          id="student-school" 
                          name="school" 
                          placeholder="Your school name"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-signup-password">Password</Label>
                        <Input 
                          id="student-signup-password" 
                          name="password" 
                          type="password"
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Sign Up as Student'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="teacher">
                    <form onSubmit={(e) => handleSignup(e, 'teacher')} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-signup-name">Full Name</Label>
                        <Input 
                          id="teacher-signup-name" 
                          name="name" 
                          placeholder="Your full name"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacher-signup-email">Email</Label>
                        <Input 
                          id="teacher-signup-email" 
                          name="email" 
                          type="email" 
                          placeholder="teacher@gamil.com"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacher-school">School</Label>
                        <Input 
                          id="teacher-school" 
                          name="school" 
                          placeholder="Your school name"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacher-signup-password">Password</Label>
                        <Input 
                          id="teacher-signup-password" 
                          name="password" 
                          type="password"
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Sign Up as Teacher'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo accounts chaile add kor*/}
        
      </div>
    </div>
  );
}