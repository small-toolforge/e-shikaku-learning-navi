"use strict";

const QUESTION_REFERENCE_REPAIR_VERSION = "v0.4.0-dev.16";
const QUESTION_REFERENCE_REPAIRS = {
  "math-q010": ["term-1-2-variance", "formula-1-2-variance"],
  "math-q016": ["term-1-2-gmm", "term-2-1-kmeans"],
  "math-q024": ["term-1-3-mutual-information", "term-1-3-conditional-entropy"]
};

function applyQuestionReferenceRepairs(questions) {
  if (!Array.isArray(questions)) return [];
  questions.forEach(question => {
    const repaired = question && QUESTION_REFERENCE_REPAIRS[question.id];
    if (repaired) question.cardIds = [...repaired];
  });
  return questions;
}

if (typeof MATH_QUESTIONS !== "undefined") applyQuestionReferenceRepairs(MATH_QUESTIONS);
