/**
 * Utility Functions
 */

import { state } from "./config.js";

// Check if answer is correct
export const isAnswerCorrect = (question, userAnswer) => {
  const type = question.type || "multiple_choice";

  if (type === "fill_in_blank_simple" || type === "short_answer") {
    return (
      userAnswer?.trim().toLowerCase() ===
      (question.correctAnswer || question.answer)?.trim().toLowerCase()
    );
  }

  if (type === "drag_drop") {
    if (question.blanks?.length > 0) {
      try {
        const userAnswers = JSON.parse(userAnswer || "{}");
        const correctAnswers = question.answer || {};
        return question.blanks.every(
          (_, idx) => userAnswers[idx] === correctAnswers[idx]
        );
      } catch {
        return false;
      }
    }

    try {
      const userOrder = JSON.parse(userAnswer || "[]");
      const correctOrder = question.answer || [];
      return (
        userOrder.length === correctOrder.length &&
        userOrder.every((id, idx) => id === correctOrder[idx])
      );
    } catch {
      return false;
    }
  }

  return userAnswer === question.answer;
};

// Calculate quiz score
export const calculateScore = () => {
  let correct = 0;
  state.currentQuizQuestions.forEach((q) => {
    if (
      state.userAnswers[q.id] &&
      isAnswerCorrect(q, state.userAnswers[q.id])
    ) {
      correct++;
    }
  });

  return {
    correct,
    incorrect: state.currentQuizQuestions.length - correct,
    total: state.currentQuizQuestions.length,
  };
};

// Convert fill-in-blank format
export const convertFillBlankFormat = (data) => {
  if (!data.questions || !data.answers) return [];

  return data.questions.map((q) => ({
    id: q.id,
    type: "fill_in_blank_simple",
    question: q.text,
    correctAnswer: q.correctAnswer,
    allAnswers: data.answers,
  }));
};

// Show tester modal
export const showTesterModal = () => {
  const modal = document.getElementById("testerModal");
  if (modal) new bootstrap.Modal(modal).show();
};
