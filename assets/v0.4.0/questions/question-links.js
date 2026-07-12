"use strict";

const QUESTION_SET_VERSION = "v0.4.0-dev.8";
const SYLLABUS_QUESTIONS = [
  ...MATH_QUESTIONS,
  ...MACHINE_LEARNING_QUESTIONS,
  ...DEEP_LEARNING_BASE_QUESTIONS
];

function findSyllabusCardById(cardId) {
  return TERMS.find(card => card.id === cardId)
    || FORMULAS.find(card => card.id === cardId)
    || COMPARES.find(card => card.id === cardId)
    || null;
}

for (const question of SYLLABUS_QUESTIONS) {
  for (const cardId of question.cardIds || []) {
    const card = findSyllabusCardById(cardId);
    if (!card) continue;
    if (!Array.isArray(card.questionIds)) card.questionIds = [];
    if (!card.questionIds.includes(question.id)) card.questionIds.push(question.id);
  }
}
