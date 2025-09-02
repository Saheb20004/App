import { ThreeDQuizGame } from './ThreeDQuizGame';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Brain, 
  Gamepad2, 
  Target, 
  Clock, 
  Star, 
  Zap,
  Trophy,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { awardXP, XP_REWARDS } from '../utils/leveling';
import { toast } from 'sonner@2.0.3';

interface GamesProps {
  user: any;
  onBack: () => void;
  onXPEarned: (xp: number) => void;
}

interface GameResult {
  score: number;
  timeSpent: number;
  xpEarned: number;
}

interface MemoryCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type GameType = 'memory' | 'word-puzzle' | 'math-challenge' | 'typing-test' | 'quiz-3d';

const games = [
  {
    id: 'memory' as GameType,
    title: 'Memory Match',
    description: 'Match pairs of cards to improve your memory',
    icon: '🧠',
    difficulty: 'Easy',
    estimatedTime: '3-5 min',
    xpReward: 30,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'word-puzzle' as GameType,
    title: 'Word Puzzle',
    description: 'Find hidden words in the letter grid',
    icon: '🔤',
    difficulty: 'Medium',
    estimatedTime: '5-8 min',
    xpReward: 40,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'math-challenge' as GameType,
    title: 'Math Challenge',
    description: 'Solve math problems as fast as you can',
    icon: '🔢',
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    xpReward: 35,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'typing-test' as GameType,
    title: 'Typing Speed',
    description: 'Test and improve your typing speed',
    icon: '⌨️',
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    xpReward: 25,
    color: 'bg-orange-100 text-orange-700'
  },
{
  id: 'quiz-3d' as GameType,
  title: '3D Quiz Arena',
  description: 'Answer questions by clicking floating 3D boards',
  icon: '🎮',
  difficulty: 'Medium',
  estimatedTime: '2-4 min',
  xpReward: 40,
  color: 'bg-teal-100 text-teal-700'
}

];

export function Games({ user, onBack, onXPEarned }: GamesProps) {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [gameStats, setGameStats] = useState({
    totalGamesPlayed: 0,
    averageScore: 0,
    bestScores: {} as Record<GameType, number>
  });

  // Load game stats
  useEffect(() => {
    const savedStats = localStorage.getItem(`gameStats_${user.id}`);
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, [user.id]);

  const saveGameStats = (stats: typeof gameStats) => {
    localStorage.setItem(`gameStats_${user.id}`, JSON.stringify(stats));
    setGameStats(stats);
  };

  const handleGameComplete = (gameType: GameType, result: GameResult) => {
    const newStats = {
      ...gameStats,
      totalGamesPlayed: gameStats.totalGamesPlayed + 1,
      averageScore: Math.round(((gameStats.averageScore * gameStats.totalGamesPlayed) + result.score) / (gameStats.totalGamesPlayed + 1)),
      bestScores: {
        ...gameStats.bestScores,
        [gameType]: Math.max(gameStats.bestScores[gameType] || 0, result.score)
      }
    };
    
    saveGameStats(newStats);
    onXPEarned(result.xpEarned);
    toast.success(`Game completed! +${result.xpEarned} XP earned! 🎉`);
    setCurrentGame(null);
  };

  if (currentGame) {
    return (
      <GamePlayer 
        gameType={currentGame}
        onComplete={(result) => handleGameComplete(currentGame, result)}
        onBack={() => setCurrentGame(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Learning Games</h1>
              <p className="text-sm text-gray-600">Play games to learn and earn XP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Gamepad2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">{gameStats.totalGamesPlayed}</p>
              <p className="text-xs text-gray-600">Games Played</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{gameStats.averageScore}%</p>
              <p className="text-xs text-gray-600">Avg Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{Object.keys(gameStats.bestScores).length}</p>
              <p className="text-xs text-gray-600">Best Scores</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Games */}
        <Card>
          <CardHeader>
            <CardTitle>Available Games</CardTitle>
            <CardDescription>Choose a game to play and earn XP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-3 rounded-lg ${game.color}`}>
                        <span className="text-2xl">{game.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{game.title}</h3>
                          <Badge variant={game.difficulty === 'Easy' ? 'secondary' : 'default'}>
                            {game.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span><Clock className="w-3 h-3 inline mr-1" />{game.estimatedTime}</span>
                          <span><Star className="w-3 h-3 inline mr-1" />{game.xpReward} XP</span>
                        </div>
                        {gameStats.bestScores[game.id] && (
                          <div className="flex items-center text-xs text-green-600 mb-2">
                            <Trophy className="w-3 h-3 mr-1" />
                            Best Score: {gameStats.bestScores[game.id]}%
                          </div>
                        )}
                        <Button 
                          onClick={() => setCurrentGame(game.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Game
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GamePlayer({ gameType, onComplete, onBack }: {
  gameType: GameType;
  onComplete: (result: GameResult) => void;
  onBack: () => void;
}) {
  const [startTime] = useState(Date.now());
if (gameType === 'quiz-3d') {
  return (
    <ThreeDQuizGame
      onComplete={(score) => onComplete(generateGameResult(score))}
      onBack={onBack}
    />
  );
}


  const generateGameResult = (score: number): GameResult => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const baseXP = XP_REWARDS.GAME_COMPLETION;
    const bonusXP = score >= 90 ? XP_REWARDS.GAME_HIGH_SCORE : 0;
    
    return {
      score,
      timeSpent,
      xpEarned: baseXP + bonusXP
    };
  };

  switch (gameType) {
    case 'memory':
      return <MemoryGame onComplete={(score) => onComplete(generateGameResult(score))} onBack={onBack} />;
    case 'word-puzzle':
      return <WordPuzzleGame onComplete={(score) => onComplete(generateGameResult(score))} onBack={onBack} />;
    case 'math-challenge':
      return <MathChallengeGame onComplete={(score) => onComplete(generateGameResult(score))} onBack={onBack} />;
    case 'typing-test':
      return <TypingTestGame onComplete={(score) => onComplete(generateGameResult(score))} onBack={onBack} />;
    default:
      return null;
  }
}

// Memory Game Component
function MemoryGame({ onComplete, onBack }: { onComplete: (score: number) => void; onBack: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const emojis = ['🎵', '🎨', '🎯', '🎪', '🎭', '🎨', '🚀', '⭐'];
  const totalPairs = emojis.length;

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis];
    const shuffled = gameEmojis.sort(() => Math.random() - 0.5);
    
    const newCards = shuffled.map((emoji, index) => ({
      id: index,
      value: emoji,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(true);
    setGameCompleted(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards[firstId];
        const secondCard = cards[secondId];

        if (firstCard.value === secondCard.value) {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setMatchedPairs(prev => prev + 1);
        } else {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (matchedPairs === totalPairs && gameStarted) {
      setGameCompleted(true);
      const score = Math.max(0, 100 - (moves - totalPairs) * 5);
      setTimeout(() => onComplete(score), 1000);
    }
  }, [matchedPairs, moves, gameStarted, totalPairs, onComplete]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>Memory Match</span>
            </CardTitle>
            <CardDescription>
              Match pairs of cards to test your memory. Try to complete in as few moves as possible!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🧠</div>
              <p className="text-sm text-gray-600">Ready to challenge your memory?</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
              <Button onClick={initializeGame} className="flex-1">
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h2 className="font-semibold">Memory Match</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Moves: {moves}</span>
              <span>Pairs: {matchedPairs}/{totalPairs}</span>
            </div>
          </div>
          <Button variant="outline" onClick={initializeGame}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`aspect-square rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                card.isFlipped || card.isMatched
                  ? 'bg-white border-2 border-blue-300'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {card.isFlipped || card.isMatched ? card.value : '?'}
              </div>
            </div>
          ))}
        </div>

        {gameCompleted && (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
              <p className="text-gray-600 mb-4">
                You completed the memory game in {moves} moves!
              </p>
              <div className="text-2xl font-bold text-blue-600">
                Score: {Math.max(0, 100 - (moves - totalPairs) * 5)}%
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Simplified Word Puzzle Game
function WordPuzzleGame({ onComplete, onBack }: { onComplete: (score: number) => void; onBack: () => void }) {
  const [score] = useState(75); // Simplified for demo
  
  useEffect(() => {
    const timer = setTimeout(() => onComplete(score), 3000);
    return () => clearTimeout(timer);
  }, [score, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🔤</div>
          <h3 className="text-lg font-semibold mb-2">Word Puzzle Game</h3>
          <p className="text-gray-600 mb-4">Game simulation...</p>
          <Button onClick={onBack}>Back to Games</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Simplified Math Challenge Game
function MathChallengeGame({ onComplete, onBack }: { onComplete: (score: number) => void; onBack: () => void }) {
  const [score] = useState(85); // Simplified for demo
  
  useEffect(() => {
    const timer = setTimeout(() => onComplete(score), 3000);
    return () => clearTimeout(timer);
  }, [score, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🔢</div>
          <h3 className="text-lg font-semibold mb-2">Math Challenge</h3>
          <p className="text-gray-600 mb-4">Game simulation...</p>
          <Button onClick={onBack}>Back to Games</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Simplified Typing Test Game
function TypingTestGame({ onComplete, onBack }: { onComplete: (score: number) => void; onBack: () => void }) {
  const [score] = useState(80); // Simplified for demo
  
  useEffect(() => {
    const timer = setTimeout(() => onComplete(score), 3000);
    return () => clearTimeout(timer);
  }, [score, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">⌨️</div>
          <h3 className="text-lg font-semibold mb-2">Typing Speed Test</h3>
          <p className="text-gray-600 mb-4">Game simulation...</p>
          <Button onClick={onBack}>Back to Games</Button>
        </CardContent>
      </Card>
    </div>
  );
}