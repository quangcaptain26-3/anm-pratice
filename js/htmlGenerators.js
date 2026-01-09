/**
 * HTML Generator Functions
 */

import { state } from "./config.js";

// Generate option HTML
const genOption = (q, key, val) => `
  <label class="option" for="q${q.id}-${key}">
    <input type="radio" name="q${q.id}" id="q${q.id}-${key}" value="${key}" style="display:none;">
    <b>${key}:</b> ${val}
  </label>`;

// Generate flag button
const genFlagBtn = (qId) => `
  <button class="flag-btn" data-question-id="${qId}" title="Đánh dấu câu hỏi này">
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="currentColor" d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z" />
    </svg>
  </button>`;

// Generate short answer HTML
const genShortAnswer = (q, idx) => {
  const ans = state.userAnswers[q.id] || "";
  return `
    <div class="quiz-question short-answer-question" id="question-${q.id}">
      ${genFlagBtn(q.id)}
      <p>${idx + 1}. ${q.question}</p>
      <div class="short-answer-container">
        <input type="text" class="short-answer-input" id="short-answer-${q.id}" 
               placeholder="Nhập câu trả lời..." value="${ans}"/>
        <div class="short-answer-feedback"></div>
      </div>
    </div>`;
};

// Generate fill-in-blank simple HTML
const genFillBlankSimple = (q, idx) => {
  const ans = state.userAnswers[q.id] || "";
  const shuffled = [...(q.allAnswers || [])].sort(() => Math.random() - 0.5);
  const qText = (q.text || q.question || "").replace(
    /_{3,}/g,
    `<span class="fill-blank-simple-drop-box" data-question-id="${q.id}">
      <span class="fill-blank-simple-content" data-answer-text="${ans}">
        ${ans || '<span class="empty-blank-simple">____</span>'}
      </span>
    </span>`
  );

  return `
    <div class="quiz-question fill-blank-simple-question" id="question-${q.id}">
      ${genFlagBtn(q.id)}
      <p>${idx + 1}. ${qText}</p>
      <div class="fill-blank-simple-container">
        <div class="fill-blank-simple-answers">
          <h4>Kéo đáp án vào chỗ trống:</h4>
          <div class="drag-items-simple">
            ${shuffled
              .map(
                (a) =>
                  `<div class="drag-item-simple" draggable="true" data-answer-text="${a}">${a}</div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>`;
};

// Generate drag-drop HTML (simplified)
const genDragDrop = (q, idx) => {
  // Check if fill-in-blank type
  if (q.blanks?.length > 0) {
    const userAns = state.userAnswers[q.id]
      ? JSON.parse(state.userAnswers[q.id])
      : {};
    const opts = (q.options || []).map((o, i) => ({ text: o, stableId: i }));
    const shuffled = [...opts].sort(() => Math.random() - 0.5);

    const sentences = q.blanks
      .map((b, bIdx) => {
        const selOpt = opts.find((o) => o.stableId === userAns[bIdx]);
        return b.sentence.replace(
          /\[BLANK\]|\{blank\}/gi,
          `<div class="blank-drop-box" data-blank-index="${bIdx}">
          <div class="blank-content" data-item-id="${selOpt?.stableId || ""}">
            ${selOpt ? selOpt.text : '<span class="empty-blank">____</span>'}
          </div>
        </div>`
        );
      })
      .join("");

    return `
      <div class="quiz-question drag-drop-question fill-blank-drag-drop" id="question-${
        q.id
      }">
        ${genFlagBtn(q.id)}
        <p>${idx + 1}. ${q.question || "Điền vào chỗ trống:"}</p>
        <div class="drag-drop-container fill-blank-container">
          <div class="fill-blank-sentences">${sentences}</div>
          <div class="drag-items-container">
            <h4>Kéo các lựa chọn vào chỗ trống:</h4>
            <div class="drag-items">
              ${shuffled
                .map(
                  (o) =>
                    `<div class="drag-item" draggable="true" data-item-id="${o.stableId}" data-item-text="${o.text}">${o.text}</div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>`;
  }

  // Regular drag-drop (ordering) - simplified version
  return `<div class="quiz-question drag-drop-question" id="question-${q.id}">
    ${genFlagBtn(q.id)}
    <p>${idx + 1}. ${q.question}</p>
    <p><em>Drag and drop ordering (implementation simplified)</em></p>
  </div>`;
};

// Main question HTML generator
export const generateQuestionHTML = (q, idx) => {
  const type = q.type || "multiple_choice";

  if (type === "fill_in_blank_simple") return genFillBlankSimple(q, idx);
  if (type === "short_answer") return genShortAnswer(q, idx);
  if (type === "drag_drop") return genDragDrop(q, idx);

  // Multiple choice
  const opts = Object.entries(q.options)
    .map(([k, v]) => genOption(q, k, v))
    .join("");
  return `
    <div class="quiz-question" id="question-${q.id}">
      ${genFlagBtn(q.id)}
      <p>${idx + 1}. ${q.question}</p>
      <div class="options">${opts}</div>
    </div>`;
};
