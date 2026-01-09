/**
 * Quiz Application - Main Entry Point (Optimized)
 * Tối ưu từ 1755 dòng xuống ~400 dòng bằng cách modularize
 */

import { QUIZ_DATA_FILES, state } from "./js/config.js";
import {
  isAnswerCorrect,
  calculateScore,
  convertFillBlankFormat,
  showTesterModal,
} from "./js/utils.js";
import { generateQuestionHTML } from "./js/htmlGenerators.js";

// ============================================================================
// STATISTICS & FEEDBACK
// ============================================================================

const updateStatsDisplay = () => {
  const el = document.getElementById("quiz-stats");
  if (!el) return;
  el.innerHTML = `
    <div class="stats-item">
      <span class="stats-label">Đúng:</span>
      <span class="stats-value correct-text">${state.questionStats.correct}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">Sai:</span>
      <span class="stats-value incorrect-text">${state.questionStats.incorrect}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">Tổng:</span>
      <span class="stats-value">${state.questionStats.total}/${state.currentQuizQuestions.length}</span>
    </div>`;
};

const updateStatisticsForAnswer = (qId, newAns, prevAns) => {
  const q = state.currentQuizQuestions.find((x) => x.id == qId);
  if (!q) return;

  const isCorrect = isAnswerCorrect(q, newAns);

  if (prevAns && prevAns !== newAns) {
    const wasPrevCorrect = isAnswerCorrect(q, prevAns);
    state.questionStats[wasPrevCorrect ? "correct" : "incorrect"]--;
    state.questionStats.total--;
  }

  if (!prevAns || prevAns !== newAns) {
    state.questionStats[isCorrect ? "correct" : "incorrect"]++;
    state.questionStats.total++;
  }
};

const applyVisualFeedback = (qId, selAns, showCorrect = false) => {
  const q = state.currentQuizQuestions.find((x) => x.id == qId);
  if (!q) return;

  const qEl = document.getElementById(`question-${qId}`);
  if (!qEl) return;

  const type = q.type || "multiple_choice";
  const isCorrect = isAnswerCorrect(q, selAns);

  if (type === "fill_in_blank_simple") {
    const box = qEl.querySelector(".fill-blank-simple-drop-box");
    if (box) {
      box.classList.remove("correct", "incorrect");
      qEl
        .querySelectorAll(".fill-blank-simple-feedback")
        .forEach((f) => f.remove());

      if (selAns?.trim()) {
        box.classList.add(isCorrect ? "correct" : "incorrect");
        if (!isCorrect && showCorrect) {
          const fb = document.createElement("div");
          fb.className = "fill-blank-simple-feedback";
          fb.innerHTML = `<strong>Đáp án đúng:</strong> <span class="correct-answer-text">${q.correctAnswer}</span>`;
          qEl.appendChild(fb);
        }
      } else if (showCorrect) {
        const fb = document.createElement("div");
        fb.className = "fill-blank-simple-feedback";
        fb.innerHTML = `<strong>Đáp án đúng:</strong> <span class="correct-answer-text">${q.correctAnswer}</span>`;
        qEl.appendChild(fb);
      }
    }
  } else if (type === "short_answer") {
    const input = qEl.querySelector(".short-answer-input");
    const fb = qEl.querySelector(".short-answer-feedback");
    if (input && fb) {
      input.classList.remove("correct", "incorrect");
      fb.innerHTML = "";
      if (selAns?.trim()) {
        input.classList.add(isCorrect ? "correct" : "incorrect");
        fb.innerHTML = isCorrect
          ? '<span class="feedback-correct">✓ Đúng!</span>'
          : `<span class="feedback-incorrect">✗ Sai. Đáp án đúng: <strong>${q.answer}</strong></span>`;
      }
    }
  } else if (type === "drag_drop") {
    // Simplified drag-drop feedback
    if (q.blanks?.length > 0) {
      const boxes = qEl.querySelectorAll(".blank-drop-box");
      try {
        const userAns = JSON.parse(selAns || "{}");
        const correctAns = q.answer || {};
        boxes.forEach((box, idx) => {
          box.classList.remove("correct", "incorrect");
          const content = box.querySelector(".blank-content");
          if (content?.dataset.itemId) {
            if (userAns[idx] === correctAns[idx]) box.classList.add("correct");
            else if (userAns[idx] != null) box.classList.add("incorrect");
          }
        });
      } catch {}
    }
  } else {
    // Multiple choice
    qEl.querySelectorAll(".option").forEach((opt) => {
      opt.classList.remove("correct", "incorrect", "selected");
    });

    Object.keys(q.options).forEach((key) => {
      const opt = qEl.querySelector(`label[for="q${qId}-${key}"]`);
      if (!opt) return;
      if (key === q.answer) opt.classList.add("correct");
      if (key === selAns) {
        opt.classList.add("selected");
        if (!isCorrect) opt.classList.add("incorrect");
      }
    });
  }
};

const updateNavigationButton = (qId, isCorrect) => {
  const btn = document.querySelector(`.nav-btn[data-question-id="${qId}"]`);
  if (!btn) return;
  btn.classList.add("answered");
  btn.classList.remove("correct-answer", "incorrect-answer");
  btn.classList.add(isCorrect ? "correct-answer" : "incorrect-answer");
};

const showAnswerFeedback = (qId, selAns) => {
  const q = state.currentQuizQuestions.find((x) => x.id == qId);
  if (!q) return;

  if (q.type === "fill_in_blank_simple") {
    const prevAns = state.userAnswers[qId];
    updateStatisticsForAnswer(qId, selAns, prevAns);
    updateStatsDisplay();
    return;
  }

  const isCorrect = selAns === q.answer;
  const prevAns = state.userAnswers[qId];

  updateStatisticsForAnswer(qId, selAns, prevAns);
  applyVisualFeedback(qId, selAns, false);
  updateStatsDisplay();
  updateNavigationButton(qId, isCorrect);
};

// ============================================================================
// UI RENDERING
// ============================================================================

const renderMainMenu = () => {
  // Group files by category
  const categories = {
    chapters: QUIZ_DATA_FILES.filter((f) => f.name.startsWith("Chương")),
    bonus: QUIZ_DATA_FILES.filter((f) => f.name.startsWith("Bonus")),
    review: QUIZ_DATA_FILES.filter((f) => f.name.startsWith("OnTap")),
    fillBlank: QUIZ_DATA_FILES.filter(
      (f) =>
        f.name.includes("📝") ||
        f.name.includes("🔥") ||
        f.name.includes("📧") ||
        f.name.includes("🦠")
    ),
  };

  const renderCategory = (title, files, icon) => {
    if (files.length === 0) return "";
    const btns = files
      .map(
        (f) =>
          `<button class="chapter-btn" data-file="${f.file}">
        <span class="chapter-name">${f.name}</span>
      </button>`
      )
      .join("");

    return `
      <div class="category-section">
        <h3 class="category-title">
          <span class="category-icon">${icon}</span>
          ${title}
        </h3>
        <div class="chapter-grid">${btns}</div>
      </div>`;
  };

  state.app.innerHTML = `
    <div id="selection-screen">
      <div class="welcome-message">
        <p>👋 Chào mừng bạn đến với hệ thống trắc nghiệm An ninh mạng!</p>
        <p class="sub-message">Chọn một chủ đề bên dưới để bắt đầu học tập</p>
      </div>
      
      ${renderCategory("Chương chính", categories.chapters, "📚")}
      ${renderCategory("Bài tập bổ sung", categories.bonus, "⭐")}
      ${renderCategory("Ôn tập tổng hợp", categories.review, "📖")}
      ${renderCategory("Điền vào chỗ trống", categories.fillBlank, "✍️")}
    </div>`;

  document.querySelectorAll(".chapter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const file = e.currentTarget.dataset.file;
      startChapterQuiz(file);
    });
  });
};

const startChapterQuiz = async (fileName) => {
  state.currentQuizFile = fileName;

  try {
    const res = await fetch(`./data/${fileName}`);
    const data = await res.json();
    const firstKey = Object.keys(data)[0];
    const rawData = data[firstKey];

    state.currentQuizQuestions =
      rawData?.questions && rawData?.answers
        ? convertFillBlankFormat(rawData)
        : Array.isArray(rawData)
        ? rawData
        : [];

    renderQuiz();
  } catch (err) {
    state.app.innerHTML = `<p>Lỗi tải file: ${fileName}</p>`;
    console.error("Error loading quiz:", err);
  }
};

const renderQuiz = () => {
  state.userAnswers = {};
  state.questionStats = { correct: 0, incorrect: 0, total: 0 };

  const questionsHTML = state.currentQuizQuestions
    .map((q, i) => generateQuestionHTML(q, i))
    .join("");

  const navBtns = state.currentQuizQuestions
    .map(
      (q, i) =>
        `<button class="nav-btn btn btn-outline-secondary" data-question-id="${
          q.id
        }">${i + 1}</button>`
    )
    .join("");

  state.app.innerHTML = `
    <div id="quiz-screen">
      <div class="quiz-header">
        <button id="back-to-menu-quiz" class="btn btn-secondary">← Về menu</button>
        <div id="quiz-stats"></div>
      </div>
      <div id="questions-container">${questionsHTML}</div>
      <button id="submit-quiz" class="btn">Nộp bài</button>
      
      <!-- Sticky Hamburger -->
      <button class="sticky-hamburger-btn" data-bs-toggle="offcanvas" data-bs-target="#questionNavOffcanvas">
        ☰
      </button>
      
      <!-- Offcanvas Navigation -->
      <div class="offcanvas offcanvas-end" id="questionNavOffcanvas">
        <div class="offcanvas-header">
          <h5>Danh sách câu hỏi</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body">
          <div id="question-nav">${navBtns}</div>
        </div>
      </div>
    </div>`;

  updateStatsDisplay();
  setupEventListeners();
  setupDragAndDrop();
};

// ============================================================================
// EVENT LISTENERS
// ============================================================================

const setupEventListeners = () => {
  // Back to menu
  document
    .getElementById("back-to-menu-quiz")
    ?.addEventListener("click", renderMainMenu);

  // Submit quiz
  document.getElementById("submit-quiz")?.addEventListener("click", submitQuiz);

  // Multiple choice
  document
    .querySelectorAll(
      ".quiz-question:not(.short-answer-question):not(.drag-drop-question):not(.fill-blank-simple-question)"
    )
    .forEach((qEl) => {
      const qId = qEl.id.replace("question-", "");
      qEl.querySelectorAll("input[type='radio']").forEach((radio) => {
        radio.addEventListener("change", (e) => {
          state.userAnswers[qId] = e.target.value;
          showAnswerFeedback(qId, e.target.value);
        });
      });
    });

  // Short answer
  document.querySelectorAll(".short-answer-input").forEach((input) => {
    const qId = input.id.replace("short-answer-", "");
    input.addEventListener("blur", (e) => {
      state.userAnswers[qId] = e.target.value;
      showAnswerFeedback(qId, e.target.value);
    });
  });

  // Navigation buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const qId = e.target.dataset.questionId;
      const offcanvas = bootstrap.Offcanvas.getInstance(
        document.getElementById("questionNavOffcanvas")
      );
      if (offcanvas) offcanvas.hide();

      setTimeout(() => {
        document
          .getElementById(`question-${qId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    });
  });
};

// ============================================================================
// DRAG & DROP (Simplified)
// ============================================================================

const setupDragAndDrop = () => {
  // Fill-in-blank simple
  document.querySelectorAll(".fill-blank-simple-question").forEach((qEl) => {
    const qId = qEl.id.replace("question-", "");
    const dropBox = qEl.querySelector(".fill-blank-simple-drop-box");

    qEl.querySelectorAll(".drag-item-simple").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.dataset.answerText);
      });
    });

    if (dropBox) {
      dropBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropBox.classList.add("drag-over");
      });

      dropBox.addEventListener("dragleave", () => {
        dropBox.classList.remove("drag-over");
      });

      dropBox.addEventListener("drop", (e) => {
        e.preventDefault();
        dropBox.classList.remove("drag-over");
        const ans = e.dataTransfer.getData("text/plain");
        const content = dropBox.querySelector(".fill-blank-simple-content");
        if (content) {
          content.textContent = ans;
          content.dataset.answerText = ans;
          state.userAnswers[qId] = ans;
          updateStatisticsForAnswer(qId, ans, state.userAnswers[qId]);
          updateStatsDisplay();
        }
      });

      dropBox.addEventListener("click", () => {
        const content = dropBox.querySelector(".fill-blank-simple-content");
        if (content?.dataset.answerText) {
          content.innerHTML = '<span class="empty-blank-simple">____</span>';
          content.dataset.answerText = "";
          delete state.userAnswers[qId];
          updateStatisticsForAnswer(qId, "", state.userAnswers[qId]);
          updateStatsDisplay();
        }
      });
    }
  });

  // Drag-drop blanks (simplified implementation)
  document.querySelectorAll(".fill-blank-drag-drop").forEach((qEl) => {
    const qId = qEl.id.replace("question-", "");
    const q = state.currentQuizQuestions.find((x) => x.id == qId);
    if (!q) return;

    const userAns = {};

    qEl.querySelectorAll(".drag-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("itemId", e.target.dataset.itemId);
        e.dataTransfer.setData("itemText", e.target.dataset.itemText);
      });
    });

    qEl.querySelectorAll(".blank-drop-box").forEach((box) => {
      box.addEventListener("dragover", (e) => {
        e.preventDefault();
        box.classList.add("drag-over");
      });

      box.addEventListener("dragleave", () => {
        box.classList.remove("drag-over");
      });

      box.addEventListener("drop", (e) => {
        e.preventDefault();
        box.classList.remove("drag-over");
        const itemId = parseInt(e.dataTransfer.getData("itemId"));
        const itemText = e.dataTransfer.getData("itemText");
        const blankIdx = parseInt(box.dataset.blankIndex);

        const content = box.querySelector(".blank-content");
        if (content) {
          content.textContent = itemText;
          content.dataset.itemId = itemId;
          userAns[blankIdx] = itemId;
          state.userAnswers[qId] = JSON.stringify(userAns);
          showAnswerFeedback(qId, state.userAnswers[qId]);
        }
      });
    });
  });
};

// ============================================================================
// SUBMIT QUIZ
// ============================================================================

const submitQuiz = () => {
  const score = calculateScore();

  // Apply feedback to all questions
  state.currentQuizQuestions.forEach((q) => {
    const ans = state.userAnswers[q.id];
    applyVisualFeedback(q.id, ans, true);
  });

  // Show result modal
  alert(
    `Kết quả:\nĐúng: ${score.correct}/${score.total}\nSai: ${score.incorrect}/${
      score.total
    }\nĐiểm: ${Math.round((score.correct / score.total) * 100)}%`
  );
};

// ============================================================================
// BACK TO TOP
// ============================================================================

const initBackToTop = () => {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  const toggleBackToTop = () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  };

  window.addEventListener("scroll", toggleBackToTop);

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  state.app = document.getElementById("app");
  renderMainMenu();
  initBackToTop();
});
