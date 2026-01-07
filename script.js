/**
 * Quiz Application - Trắc nghiệm An Ninh Mạng
 * 
 * Main application file handling quiz logic, UI rendering, and user interactions.
 * 
 * @author Your Name
 * @version 1.0.0
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/** List of quiz data files available in the application */
const QUIZ_DATA_FILES = [
    { name: "Chương 1-2", file: "chuong1-2.json" },
    { name: "Chương 3-4", file: "chuong3-4.json" },
    { name: "Chương 5-6", file: "chuong5-6.json" },
    { name: "Chương 7-8", file: "chuong7-8.json" },
    { name: "Bonus 1", file: "bonus1.json" },
    { name: "Bonus 2", file: "bonus2.json" },
    { name: "Bonus 3", file: "bonus3.json" },
    { name: "Bonus 4", file: "bonus4.json" },
    { name: "Bonus 5", file: "bonus5.json" },
    { name: "Bonus 6", file: "bonus6.json" },
    { name: "OnTap1", file: "ontap1.json" },
    { name: "OnTap2", file: "ontap2.json" },
    { name: "OnTap3", file: "ontap3.json" },
  ];

// ============================================================================
// APPLICATION STATE
// ============================================================================

/** Main app container element (will be initialized when DOM loads) */
let app = null;

/** Current quiz questions loaded from JSON file */
  let currentQuizQuestions = [];

/** User's answers: { questionId: selectedAnswer } */
  let userAnswers = {};

/** Current quiz file name for redo functionality */
let currentQuizFile = null;

/** Statistics tracking: correct, incorrect, and total answered */
let questionStats = {
  correct: 0,
  incorrect: 0,
  total: 0
};

/** Set of question IDs that are bookmarked (marked for review) */
let bookmarkedQuestions = new Set();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Shows the tester modal notification
 */
const showTesterModal = () => {
  const testerModalElement = document.getElementById('testerModal');
  if (testerModalElement) {
    const testerModal = new bootstrap.Modal(testerModalElement);
    testerModal.show();
  }
};

/**
 * Calculates quiz score based on user answers
 * @returns {Object} Score object with correct and incorrect counts
 */
const calculateScore = () => {
  let correctCount = 0;
  currentQuizQuestions.forEach((question) => {
    if (userAnswers[question.id] === question.answer) {
      correctCount++;
    }
  });
  
  return {
    correct: correctCount,
    incorrect: currentQuizQuestions.length - correctCount,
    total: currentQuizQuestions.length
  };
};

/**
 * Generates HTML for a single question option
 * @param {Object} question - Question object
 * @param {string} optionKey - Option key (A, B, C, D)
 * @param {string} optionValue - Option text value
 * @returns {string} HTML string for the option
 */
const generateQuestionOptionHTML = (question, optionKey, optionValue) => {
  return `
    <label class="option" for="q${question.id}-${optionKey}">
      <input type="radio" name="q${question.id}" id="q${question.id}-${optionKey}" value="${optionKey}" style="display:none;">
      <b>${optionKey}:</b> ${optionValue}
    </label>
  `;
};

/**
 * Generates HTML for a single question
 * @param {Object} question - Question object
 * @param {number} index - Question index (0-based)
 * @returns {string} HTML string for the question
 */
const generateQuestionHTML = (question, index) => {
  const optionsHTML = Object.entries(question.options)
    .map(([key, value]) => generateQuestionOptionHTML(question, key, value))
    .join("");

  const isBookmarked = bookmarkedQuestions.has(question.id);
  const bookmarkIcon = isBookmarked 
    ? '<path fill-rule="evenodd" d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2z"/>'
    : '<path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.5l4.868-2.7a.5.5 0 0 1 .264 0L13 14.5V2a1 1 0 0 0-1-1H4z"/>';

  return `
    <div class="quiz-question" id="question-${question.id}">
      <div class="question-header">
        <p>${index + 1}. ${question.question}</p>
        <button 
          class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
          data-question-id="${question.id}"
          type="button"
          title="${isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            ${bookmarkIcon}
          </svg>
        </button>
      </div>
      <div class="options">
        ${optionsHTML}
      </div>
    </div>
  `;
};

// ============================================================================
// STATISTICS MANAGEMENT
// ============================================================================

/**
 * Updates the statistics display in the UI
 */
const updateStatsDisplay = () => {
  const statsElement = document.getElementById("quiz-stats");
  if (!statsElement) return;

  statsElement.innerHTML = `
    <div class="stats-item">
      <span class="stats-label">Đúng:</span>
      <span class="stats-value correct-text">${questionStats.correct}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">Sai:</span>
      <span class="stats-value incorrect-text">${questionStats.incorrect}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">Tổng:</span>
      <span class="stats-value">${questionStats.total}/${currentQuizQuestions.length}</span>
    </div>
  `;
};

/**
 * Resets statistics to initial state
 */
const resetStatistics = () => {
  questionStats = {
    correct: 0,
    incorrect: 0,
    total: 0
  };
};

// ============================================================================
// ANSWER FEEDBACK & VALIDATION
// ============================================================================

/**
 * Updates statistics when user changes their answer
 * @param {string} questionId - Question ID
 * @param {string} newAnswer - New selected answer
 * @param {string} previousAnswer - Previous selected answer (if any)
 */
const updateStatisticsForAnswer = (questionId, newAnswer, previousAnswer) => {
  const question = currentQuizQuestions.find(q => q.id == questionId);
  if (!question) return;

  const isCorrect = newAnswer === question.answer;

  // Remove previous answer from stats if it existed and was different
  if (previousAnswer && previousAnswer !== newAnswer) {
    const wasPreviousCorrect = previousAnswer === question.answer;
    if (wasPreviousCorrect) {
      questionStats.correct--;
    } else {
      questionStats.incorrect--;
    }
    questionStats.total--;
  }

  // Add new answer to stats (only if it's a new answer or changed)
  if (!previousAnswer || previousAnswer !== newAnswer) {
    if (isCorrect) {
      questionStats.correct++;
    } else {
      questionStats.incorrect++;
    }
    questionStats.total++;
  }
};

/**
 * Applies visual feedback to question options
 * @param {string} questionId - Question ID
 * @param {string} selectedAnswer - User's selected answer
 */
const applyVisualFeedback = (questionId, selectedAnswer) => {
  const question = currentQuizQuestions.find(q => q.id == questionId);
  if (!question) return;

  const questionElement = document.getElementById(`question-${questionId}`);
  if (!questionElement) return;

  const isCorrect = selectedAnswer === question.answer;

  // Remove previous feedback classes
  questionElement.querySelectorAll('.option').forEach(option => {
    option.classList.remove('correct', 'incorrect', 'selected');
  });

  // Mark correct answer and user's selection
  Object.keys(question.options).forEach(optionKey => {
    const optionElement = questionElement.querySelector(`label[for="q${questionId}-${optionKey}"]`);
    if (!optionElement) return;

    // Always show correct answer
    if (optionKey === question.answer) {
      optionElement.classList.add('correct');
    }

    // Mark user's selection
    if (optionKey === selectedAnswer) {
      optionElement.classList.add('selected');
      if (!isCorrect) {
        optionElement.classList.add('incorrect');
      }
    }
  });
};

/**
 * Updates navigation button appearance based on answer status
 * @param {string} questionId - Question ID
 * @param {boolean} isCorrect - Whether the answer is correct
 */
const updateNavigationButton = (questionId, isCorrect) => {
  const navButton = document.querySelector(`.nav-btn[data-question-id="${questionId}"]`);
  if (!navButton) return;

  navButton.classList.add('answered');
  navButton.classList.remove('correct-answer', 'incorrect-answer');
  
  if (isCorrect) {
    navButton.classList.add('correct-answer');
  } else {
    navButton.classList.add('incorrect-answer');
  }
};

/**
 * Shows immediate feedback when user selects an answer
 * @param {string} questionId - Question ID
 * @param {string} selectedAnswer - User's selected answer
 */
const showAnswerFeedback = (questionId, selectedAnswer) => {
  const question = currentQuizQuestions.find(q => q.id == questionId);
  if (!question) return;

  const isCorrect = selectedAnswer === question.answer;
  const previousAnswer = userAnswers[questionId];

  // Update statistics
  updateStatisticsForAnswer(questionId, selectedAnswer, previousAnswer);

  // Apply visual feedback
  applyVisualFeedback(questionId, selectedAnswer);

  // Update stats display
  updateStatsDisplay();

  // Update navigation button
  updateNavigationButton(questionId, isCorrect);
};

// ============================================================================
// UI RENDERING FUNCTIONS
// ============================================================================

/**
 * Renders the main menu screen with chapter selection
   */
  const renderMainMenu = () => {
  const chapterButtonsHTML = QUIZ_DATA_FILES
    .map(file => `<button class="btn" data-file="${file.file}">${file.name}</button>`)
    .join("");

    app.innerHTML = `
            <div id="selection-screen">
                <h2>Chọn chương để bắt đầu</h2>
                <div class="chapter-list">
        ${chapterButtonsHTML}
                </div>
            </div>
        `;

  // Attach event listeners to chapter buttons
    document.querySelectorAll(".btn[data-file]").forEach((button) => {
      button.addEventListener("click", (e) => {
        startChapterQuiz(e.target.dataset.file);
      });
    });
  };

  /**
 * Loads and starts a quiz for a specific chapter
 * @param {string} fileName - Name of the JSON file to load
   */
  const startChapterQuiz = async (fileName) => {
  currentQuizFile = fileName;
  
  try {
    const response = await fetch(`./data/${fileName}`);
    const data = await response.json();
    const firstKey = Object.keys(data)[0];
    currentQuizQuestions = data[firstKey] || [];
    
      renderQuiz();
    } catch (error) {
      app.innerHTML = `<p>Lỗi tải file: ${fileName}</p>`;
    console.error("Error loading quiz file:", error);
    }
  };

/**
 * Generates HTML for navigation buttons in the offcanvas menu
 * @returns {string} HTML string for navigation buttons
 */
const generateNavigationButtonsHTML = () => {
  return currentQuizQuestions
    .map((question, index) => {
      const isBookmarked = bookmarkedQuestions.has(question.id);
      const bookmarkClass = isBookmarked ? 'bookmarked' : '';
      return `<button class="nav-btn btn btn-outline-secondary ${bookmarkClass}" data-question-id="${question.id}">${index + 1}</button>`;
    })
    .join("");
};

/**
 * Sets up navigation button event listeners
 */
const setupNavigationButtons = () => {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const questionId = e.target.dataset.questionId;
      
      // Close offcanvas menu
      const offcanvas = bootstrap.Offcanvas.getInstance(
        document.getElementById('questionNavOffcanvas')
      );
      if (offcanvas) {
        offcanvas.hide();
      }

      // Scroll to question after menu closes
      setTimeout(() => {
        const questionElement = document.getElementById(`question-${questionId}`);
        if (questionElement) {
          questionElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        }
      }, 300);
    });
  });
};

/**
 * Sets up answer selection event listeners
 */
const setupAnswerSelection = () => {
    document.querySelectorAll(".options input").forEach((input) => {
      input.addEventListener("change", (e) => {
      const questionId = e.target.name.substring(1); // Remove 'q' prefix
      const selectedAnswer = e.target.value;
      
      // Show immediate feedback (before updating userAnswers)
      showAnswerFeedback(questionId, selectedAnswer);
      
      // Update userAnswers after showing feedback
      userAnswers[questionId] = selectedAnswer;
    });
    });
  };

  /**
 * Renders the quiz interface with questions and navigation
 */
/**
 * Toggles bookmark status for a question
 * @param {string} questionId - Question ID to toggle bookmark
 */
const toggleBookmark = (questionId) => {
  if (bookmarkedQuestions.has(questionId)) {
    bookmarkedQuestions.delete(questionId);
  } else {
    bookmarkedQuestions.add(questionId);
  }
  
  // Update bookmark button appearance
  const bookmarkBtn = document.querySelector(`.bookmark-btn[data-question-id="${questionId}"]`);
  if (bookmarkBtn) {
    bookmarkBtn.classList.toggle('bookmarked');
    
    // Update bookmark icon
    const svg = bookmarkBtn.querySelector('svg path');
    if (bookmarkedQuestions.has(questionId)) {
      svg.setAttribute('d', 'M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2z');
      bookmarkBtn.title = 'Bỏ đánh dấu';
    } else {
      svg.setAttribute('d', 'M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.5l4.868-2.7a.5.5 0 0 1 .264 0L13 14.5V2a1 1 0 0 0-1-1H4z');
      bookmarkBtn.title = 'Đánh dấu câu hỏi';
    }
  }
  
  // Update navigation button appearance
  const navBtn = document.querySelector(`.nav-btn[data-question-id="${questionId}"]`);
  if (navBtn) {
    navBtn.classList.toggle('bookmarked');
  }
};

/**
 * Sets up bookmark button event listeners
 */
const setupBookmarkButtons = () => {
  document.querySelectorAll(".bookmark-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const questionId = button.dataset.questionId;
      toggleBookmark(questionId);
    });
  });
};

const renderQuiz = () => {
  // Reset state
  userAnswers = {};
  resetStatistics();
  bookmarkedQuestions.clear(); // Reset bookmarks when starting new quiz
  
  // Generate questions HTML
  const questionsHTML = currentQuizQuestions
    .map((question, index) => generateQuestionHTML(question, index))
    .join("");

  app.innerHTML = `
    <div id="quiz-screen">
      <div class="quiz-header mb-3">
        <button class="btn btn-secondary" id="back-to-menu-quiz">Quay lại</button>
      </div>
      
      <!-- Sticky Hamburger Navigation Button -->
      <button 
        class="btn btn-outline-primary sticky-hamburger-btn" 
        id="hamburger-btn" 
        type="button" 
        data-bs-toggle="offcanvas" 
        data-bs-target="#questionNavOffcanvas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
      
      <!-- Statistics Display -->
      <div id="quiz-stats" class="mb-3"></div>
      
      <!-- Questions Container -->
      <div id="quiz-content">
        ${questionsHTML}
      </div>
      
      <!-- Submit Button -->
      <button class="btn" id="submit-btn">Nộp bài</button>
    </div>
    
    <!-- Offcanvas Navigation Menu -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="questionNavOffcanvas">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">Điều hướng câu hỏi</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <div id="question-nav" class="d-flex flex-wrap gap-2"></div>
      </div>
    </div>
  `;

  // Initialize components
  updateStatsDisplay();
  
  // Setup navigation buttons
  const questionNav = document.getElementById("question-nav");
  questionNav.innerHTML = generateNavigationButtonsHTML();
  setupNavigationButtons();

  // Setup event listeners
  document.getElementById("back-to-menu-quiz")
    .addEventListener("click", renderMainMenu);

  document.getElementById("submit-btn")
    .addEventListener("click", renderResults);

  setupAnswerSelection();
  setupBookmarkButtons();
};

/**
 * Generates HTML for a single option in the answer review
 * @param {Object} question - Question object
 * @param {string} optionKey - Option key
 * @param {string} optionValue - Option value
 * @param {string} userAnswer - User's selected answer
 * @returns {string} HTML string for the option
 */
const generateReviewOptionHTML = (question, optionKey, optionValue, userAnswer) => {
  let classList = "option";
  const isCorrect = userAnswer === question.answer;
  
  if (optionKey === question.answer) {
    classList += " correct";
  }
  if (optionKey === userAnswer) {
    classList += " selected";
    if (!isCorrect) {
      classList += " incorrect";
    }
  }

  return `<div class="${classList}"><b>${optionKey}:</b> ${optionValue}</div>`;
};

/**
 * Renders the detailed answer review screen
 */
const renderAnswerReview = () => {
  const reviewContainer = document.getElementById("answer-review-container");
  const summaryElement = document.querySelector(".result-summary");
  
  if (!reviewContainer || !summaryElement) return;

  // Hide summary and show review
  summaryElement.style.display = "none";
  reviewContainer.style.display = "block";

  // Generate review HTML
  const reviewHTML = currentQuizQuestions
    .map((question, index) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.answer;
      
      const optionsHTML = Object.entries(question.options)
        .map(([key, value]) => 
          generateReviewOptionHTML(question, key, value, userAnswer)
        )
        .join("");

      const noAnswerMessage = !userAnswer 
        ? '<p class="no-answer"><i>Bạn chưa trả lời câu này.</i></p>'
        : "";

      return `
        <div class="quiz-question result-item">
          <p>${index + 1}. ${question.question}</p>
          <div class="options">
            ${optionsHTML}
          </div>
          ${noAnswerMessage}
        </div>
      `;
    })
    .join("");

  reviewContainer.innerHTML = `
    <div class="quiz-header">
      <button class="btn btn-secondary" id="back-to-summary-btn">Quay lại kết quả</button>
    </div>
    <h3 style="text-align: center; margin-bottom: 2rem;">Chi tiết bài làm</h3>
    ${reviewHTML}
  `;

  // Setup back button
  document.getElementById("back-to-summary-btn")
    .addEventListener("click", renderResults);
};

/**
 * Renders the results summary screen after quiz completion
   */
  const renderResults = () => {
  const score = calculateScore();

    app.innerHTML = `
            <div id="result-screen">
                <div class="result-summary">
                    <h2>Hoàn thành!</h2>
        <p>Số câu đúng: <span class="correct-text">${score.correct}</span></p>
        <p>Số câu sai: <span class="incorrect-text">${score.incorrect}</span></p>
                    <div class="result-actions">
                        <button class="btn" id="review-btn">Xem lại bài làm</button>
                        <button class="btn btn-secondary" id="redo-btn">Làm lại bài</button>
                        <button class="btn btn-secondary" id="back-to-menu">Về trang chủ</button>
                    </div>
                </div>
                <div id="answer-review-container" style="display: none;"></div>
            </div>
        `;

  // Setup event listeners
  document.getElementById("review-btn")
    .addEventListener("click", renderAnswerReview);

  document.getElementById("redo-btn")
    .addEventListener("click", () => {
      if (currentQuizFile) {
        startChapterQuiz(currentQuizFile);
      }
    });

  document.getElementById("back-to-menu")
      .addEventListener("click", renderMainMenu);

  // Show tester modal after completing test
  setTimeout(() => {
    showTesterModal();
  }, 500);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the application when DOM is loaded
 */
const initializeApp = () => {
  // Get app container element
  app = document.getElementById("app");
  
  if (!app) {
    console.error("App element not found!");
    return;
  }

  // Render main menu
  renderMainMenu();

  // Show tester modal after a short delay to ensure Bootstrap is loaded
  setTimeout(() => {
    showTesterModal();
  }, 300);
};

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
