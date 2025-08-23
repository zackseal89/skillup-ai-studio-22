import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStartLearningSession, useEndLearningSession } from "@/hooks/useLearningTime";
import { useToast } from "@/hooks/use-toast";

interface LearningTimerProps {
  courseId?: string;
  sessionType: 'course' | 'assessment' | 'practice';
  autoStart?: boolean;
}

export function LearningTimer({ courseId, sessionType, autoStart = false }: LearningTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const startSession = useStartLearningSession();
  const endSession = useEndLearningSession();
  const { toast } = useToast();

  useEffect(() => {
    if (autoStart) {
      handleStart();
    }
    
    // Cleanup on unmount
    return () => {
      if (currentSessionId) {
        handleStop();
      }
    };
  }, [autoStart]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = async () => {
    try {
      const session = await startSession.mutateAsync({ courseId, sessionType });
      setCurrentSessionId(session.id);
      setIsRunning(true);
      setTimeElapsed(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start learning session.",
        variant: "destructive"
      });
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = async () => {
    if (!currentSessionId) return;

    try {
      await endSession.mutateAsync(currentSessionId);
      setIsRunning(false);
      setTimeElapsed(0);
      setCurrentSessionId(null);
      
      const minutes = Math.floor(timeElapsed / 60);
      toast({
        title: "Session completed",
        description: `You studied for ${minutes} minutes. Great work!`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end learning session.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-fit">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-mono font-bold">
            {formatTime(timeElapsed)}
          </div>
          
          <div className="flex space-x-2">
            {!currentSessionId ? (
              <Button 
                size="sm" 
                onClick={handleStart}
                disabled={startSession.isPending}
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button size="sm" variant="outline" onClick={handlePause}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleResume}>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleStop}
                  disabled={endSession.isPending}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}