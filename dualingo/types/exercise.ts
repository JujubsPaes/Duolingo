import type { ImageSourcePropType } from "react-native";

export type ExerciseType = "multiple_choice" | "true_false";

export interface ExerciseOption {
  id: string;
  label: string;
}

export interface ExerciseFeedback {
  submitted: boolean;
  isCorrect: boolean;
  explanation?: string;
}

interface BaseExercise {
  id: string;
  question: string;
  /** Texto auxiliar abaixo da pergunta (ex.: instrução das alternativas). */
  prompt?: string;
  /** Ilustração entre o título e o enunciado; omitir para usar a imagem mock padrão. */
  image?: ImageSourcePropType;
  imageAlt?: string;
  correctAnswerId: string;
  /** Explicação exibida no feedback após o usuário responder. */
  explanation?: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: "multiple_choice";
  options: ExerciseOption[];
}

export interface TrueFalseExercise extends BaseExercise {
  type: "true_false";
}

export type Exercise = MultipleChoiceExercise | TrueFalseExercise;

export interface ExerciseCardProps {
  exercise: Exercise;
  selectedAnswerId: string | null;
  onSelectAnswer: (answerId: string) => void;
  feedback?: ExerciseFeedback | null;
  /** Bloqueia novas seleções após confirmar a resposta. */
  disabled?: boolean;
  /** Usado quando a tela tem rodapé fixo (botões Confirmar/Próximo). */
  embedInScreen?: boolean;
  /** ID do curso atual — usado pra mostrar a imagem certa (expo ou aws). */
  courseId?: string;
}
