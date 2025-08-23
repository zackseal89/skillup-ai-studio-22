import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, ArrowLeft, Play, Pause, SkipForward, MessageCircle, 
  Code, BookOpen, CheckCircle, Clock, Lightbulb, Send, User
} from "lucide-react";

const CourseView = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(180); // 3 minutes
  const [totalTime] = useState(720); // 12 minutes
  const [chatMessage, setChatMessage] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("");

  const course = {
    title: "Machine Learning Fundamentals",
    lesson: "Introduction to Neural Networks",
    progress: 45,
    instructor: "Dr. Sarah Chen",
    duration: "12 min"
  };

  const chatHistory = [
    {
      type: "ai",
      message: "Welcome to this lesson on Neural Networks! I'm here to help you understand the concepts. What specific aspect would you like to explore?",
      time: "10:30 AM"
    },
    {
      type: "user", 
      message: "Can you explain how backpropagation works in simple terms?",
      time: "10:32 AM"
    },
    {
      type: "ai",
      message: "Great question! Think of backpropagation like learning from mistakes. When the neural network makes a prediction, it compares the result with the correct answer. Then it works backwards through the network, adjusting the connections (weights) to minimize the error. It's like a student reviewing their test, identifying where they went wrong, and adjusting their study approach.",
      time: "10:33 AM"
    }
  ];

  const codingChallenge = {
    question: "Implement a simple perceptron that can classify data points as either positive (1) or negative (0). Complete the forward pass function:",
    starter: `class SimplePerceptron:
    def __init__(self, weights, bias):
        self.weights = weights
        self.bias = bias
    
    def forward_pass(self, inputs):
        # Your code here
        # Calculate weighted sum and apply activation function
        pass`,
    hint: "Remember: weighted sum = (inputs × weights) + bias, then apply step function"
  };

  const lessonContent = [
    { type: "concept", title: "What are Neural Networks?", completed: true },
    { type: "concept", title: "Structure and Components", completed: true },
    { type: "video", title: "Neural Network Architecture", completed: false, current: true },
    { type: "coding", title: "Building Your First Perceptron", completed: false },
    { type: "quiz", title: "Knowledge Check", completed: false }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Here you would send the message to your AI chat service
      setChatMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/courses" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-smooth">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Courses</span>
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-semibold text-foreground">{course.title}</h1>
                  <p className="text-sm text-muted-foreground">{course.lesson}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{course.progress}% Complete</div>
                <Progress value={course.progress} className="w-20 h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className="shadow-medium border-border">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-subtle rounded-t-lg relative flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Video: Neural Network Architecture</p>
                    <p className="text-sm">by {course.instructor}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg"></div>
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="hero" 
                        size="sm" 
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(totalTime)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.duration}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={(currentTime / totalTime) * 100} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Lesson Content</TabsTrigger>
                <TabsTrigger value="coding">Coding Exercise</TabsTrigger>
                <TabsTrigger value="notes">My Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card className="shadow-medium border-border">
                  <CardHeader>
                    <CardTitle>Lesson Overview</CardTitle>
                    <CardDescription>
                      Learn the fundamental concepts of neural networks and how they process information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lessonContent.map((item, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border ${item.current ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-success text-white' : 
                          item.current ? 'bg-primary text-white' : 'bg-muted'
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="text-sm text-muted-foreground capitalize">{item.type}</div>
                        </div>
                        {item.current && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coding" className="mt-6">
                <Card className="shadow-medium border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5" />
                      <span>Coding Challenge</span>
                    </CardTitle>
                    <CardDescription>
                      Apply what you've learned by implementing a simple perceptron.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Challenge:</h4>
                      <p className="text-sm text-muted-foreground">{codingChallenge.question}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Code Editor:</h4>
                      <Textarea
                        placeholder="Write your code here..."
                        value={codeAnswer}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                        defaultValue={codingChallenge.starter}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="ai" size="sm">
                        <Lightbulb className="h-4 w-4" />
                        Get Hint
                      </Button>
                      <Button variant="success">
                        Run Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <Card className="shadow-medium border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>My Notes</span>
                    </CardTitle>
                    <CardDescription>
                      Take notes on key concepts and insights from this lesson.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your notes here..."
                      className="min-h-[300px]"
                    />
                    <Button variant="hero" className="mt-4">
                      Save Notes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Chat Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-medium border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>AI Learning Assistant</span>
                </CardTitle>
                <CardDescription>
                  Ask questions and get personalized help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex items-start space-x-2 ${chat.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        chat.type === 'ai' ? 'bg-primary text-white' : 'bg-muted'
                      }`}>
                        {chat.type === 'ai' ? (
                          <Brain className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`flex-1 ${chat.type === 'user' ? 'text-right' : ''}`}>
                        <div className={`p-3 rounded-lg text-sm ${
                          chat.type === 'ai' 
                            ? 'ai-message' 
                            : 'bg-primary text-white'
                        }`}>
                          {chat.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{chat.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask me anything about this lesson..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="min-h-0 h-10 resize-none"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  />
                  <Button variant="hero" size="sm" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-medium border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4" />
                  Download Resources
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4" />
                  Join Discussion
                </Button>
                <Button variant="success" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4" />
                  Mark as Complete
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;