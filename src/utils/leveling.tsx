// Leveling system for the gamified learning platform

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpToNext: number;
  totalXPForLevel: number;
  title: string;
  icon: string;
  color: string;
}

// XP requirements for each level (exponential growth)
const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.5, level - 2));
};

// Calculate total XP needed to reach a specific level
const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

// Level titles and themes
const levelTitles = [
  { title: "Curious Beginner", icon: "🌱", color: "text-green-600" },
  { title: "Eager Learner", icon: "📚", color: "text-blue-600" },
  { title: "Knowledge Seeker", icon: "🔍", color: "text-purple-600" },
  { title: "Bright Student", icon: "💡", color: "text-yellow-600" },
  { title: "Smart Scholar", icon: "🎓", color: "text-indigo-600" },
  { title: "Wise Apprentice", icon: "⭐", color: "text-orange-600" },
  { title: "Master Student", icon: "🏆", color: "text-red-600" },
  { title: "Learning Champion", icon: "👑", color: "text-pink-600" },
  { title: "Knowledge Master", icon: "🔮", color: "text-cyan-600" },
  { title: "Wisdom Guardian", icon: "🦉", color: "text-emerald-600" },
  { title: "Ultimate Scholar", icon: "🌟", color: "text-amber-600" }
];

export const calculateLevel = (totalXP: number): LevelInfo => {
  let level = 1;
  let accumulatedXP = 0;
  
  // Find the current level
  while (accumulatedXP + getXPForLevel(level + 1) <= totalXP) {
    accumulatedXP += getXPForLevel(level + 1);
    level++;
  }
  
  const currentXP = totalXP - accumulatedXP;
  const xpToNext = getXPForLevel(level + 1) - currentXP;
  const totalXPForLevel = getXPForLevel(level + 1);
  
  const levelIndex = Math.min(level - 1, levelTitles.length - 1);
  const { title, icon, color } = levelTitles[levelIndex];
  
  return {
    level,
    currentXP,
    xpToNext,
    totalXPForLevel,
    title,
    icon,
    color
  };
};

// XP rewards for different activities
export const XP_REWARDS = {
  QUIZ_COMPLETION: 50,
  PERFECT_SCORE: 25, // Bonus for 100%
  DAILY_LOGIN: 10,
  GAME_COMPLETION: 30,
  GAME_HIGH_SCORE: 15, // Bonus for beating previous score
  STUDY_STREAK_BONUS: 20,
  LESSON_COMPLETION: 25,
  BADGE_EARNED: 40,
  HELPING_CLASSMATE: 15
};

// Award XP to user and return new level info
export const awardXP = (currentTotalXP: number, xpToAdd: number): { 
  newTotalXP: number; 
  levelInfo: LevelInfo; 
  leveledUp: boolean;
  prevLevel: number;
} => {
  const prevLevel = calculateLevel(currentTotalXP).level;
  const newTotalXP = currentTotalXP + xpToAdd;
  const levelInfo = calculateLevel(newTotalXP);
  const leveledUp = levelInfo.level > prevLevel;
  
  return {
    newTotalXP,
    levelInfo,
    leveledUp,
    prevLevel
  };
};

// Get progress percentage for current level
export const getLevelProgress = (levelInfo: LevelInfo): number => {
  return Math.round((levelInfo.currentXP / levelInfo.totalXPForLevel) * 100);
};