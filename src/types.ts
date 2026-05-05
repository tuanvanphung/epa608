export type Category = 'Core' | 'Type II';

export interface Question {
  id: string;
  category: Category;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: (number | null)[];
  isFinished: boolean;
  score: number;
  startTime: number;
  endTime?: number;
}

export interface CategoryStats {
  category: Category;
  total: number;
  correct: number;
  incorrect: number;
}
