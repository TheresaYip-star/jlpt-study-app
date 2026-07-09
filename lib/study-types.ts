export type Vocabulary = {
  id: string;
  level_code: string;
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string | null;
  notes: string | null;
};

export type ExampleSentence = {
  id: string;
  vocabulary_id: string | null;
  japanese: string;
  reading: string;
  translation: string;
};

export type ProgressStats = {
  wordsStudied: number;
  cardsKnown: number;
  cardsUnknown: number;
  quizzesTaken: number;
  averageScore: number;
  studiedToday: number;
  dailyGoal: number;
  streak: number;
};
