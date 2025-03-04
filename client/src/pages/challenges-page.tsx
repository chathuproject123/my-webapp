import { useQuery } from "@tanstack/react-query";
import { Challenge, UserProgress } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Brain, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ChallengesPage() {
  const { user } = useAuth();
  
  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/challenges/progress"],
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = () => {
    if (!challenges || !progress) return 0;
    return (progress.filter(p => p.completed).length / challenges.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6">
      {/* User Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Level {user?.level}</p>
              <p className="text-2xl font-bold">{user?.experiencePoints} XP</p>
            </div>
            <Progress value={calculateProgress()} className="w-1/2" />
          </div>
        </CardContent>
      </Card>

      {/* Challenge Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges?.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  {challenge.type === 'quiz' ? (
                    <Brain className="h-5 w-5 text-purple-500" />
                  ) : (
                    <Target className="h-5 w-5 text-blue-500" />
                  )}
                  {challenge.title}
                </CardTitle>
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{challenge.points} XP</span>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/challenges/${challenge.id}`}
                >
                  {progress?.find(p => p.challengeId === challenge.id)?.completed
                    ? "Review"
                    : "Start Challenge"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
