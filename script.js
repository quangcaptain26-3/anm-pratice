document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  const dataFiles = [
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
    { name: "OnTap4", file: "ontap4.json" },
  ];

  let currentQuizQuestions = [];
  let userAnswers = {};
  let currentQuizFile = null; // To keep track of the current quiz for the "redo" function
  let questionStats = { correct: 0, incorrect: 0, total: 0 }; // Track statistics

  /**
   * Renders the main menu screen.
   */
  const renderMainMenu = () => {
    app.innerHTML = `
            <div id="selection-screen">
                <h2>Chọn chương để bắt đầu</h2>
                <div class="chapter-list">
                    ${dataFiles
                      .map(
                        (df) =>
                          `<button class="btn" data-file="${df.file}">${df.name}</button>`
                      )
                      .join("")}
                </div>
            </div>
        `;

    document.querySelectorAll(".btn[data-file]").forEach((button) => {
      button.addEventListener("click", (e) => {
        startChapterQuiz(e.target.dataset.file);
      });
    });
  };

  /**
   * Starts a quiz for a specific chapter.
   */
  const startChapterQuiz = async (fileName) => {
    currentQuizFile = fileName; // Save the current file
    try {
      const res = await fetch(`./data/${fileName}`);
      const data = await res.json();
      const key = Object.keys(data)[0];
      currentQuizQuestions = data[key] || [];
      renderQuiz();
    } catch (error) {
      app.innerHTML = `<p>Lỗi tải file: ${fileName}</p>`;
      console.error(error);
    }
  };

  /**
   * Updates the statistics display
   */
  const updateStats = () => {
    const statsElement = document.getElementById("quiz-stats");
    if (statsElement) {
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
    }
  };

  /**
   * Shows immediate feedback for a selected answer
   */
  const showAnswerFeedback = (questionId, selectedAnswer) => {
    const question = currentQuizQuestions.find(q => q.id == questionId);
    if (!question) return;

    const isCorrect = selectedAnswer === question.answer;
    const questionElement = document.getElementById(`question-${questionId}`);
    
    // Get previous answer before updating
    const previousAnswer = userAnswers[questionId];
    
    // Remove previous answer from stats if it existed
    if (previousAnswer && previousAnswer !== selectedAnswer) {
      const wasCorrect = previousAnswer === question.answer;
      if (wasCorrect) {
        questionStats.correct--;
      } else {
        questionStats.incorrect--;
      }
      questionStats.total--;
    }
    
    // Remove previous feedback classes
    questionElement.querySelectorAll('.option').forEach(opt => {
      opt.classList.remove('correct', 'incorrect', 'selected');
    });

    // Mark all options
    Object.keys(question.options).forEach(key => {
      const optionElement = questionElement.querySelector(`label[for="q${questionId}-${key}"]`);
      if (!optionElement) return;

      if (key === question.answer) {
        optionElement.classList.add('correct');
      }
      if (key === selectedAnswer) {
        optionElement.classList.add('selected');
        if (!isCorrect) {
          optionElement.classList.add('incorrect');
        }
      }
    });

    // Add new answer to stats (only if it's a new answer or changed)
    if (!previousAnswer || previousAnswer !== selectedAnswer) {
      if (isCorrect) {
        questionStats.correct++;
      } else {
        questionStats.incorrect++;
      }
      questionStats.total++;
    }

    // Update stats display
    updateStats();

    // Update nav button
    const navBtn = document.querySelector(`.nav-btn[data-question-id="${questionId}"]`);
    if (navBtn) {
      navBtn.classList.add('answered');
      navBtn.classList.remove('correct-answer', 'incorrect-answer');
      if (isCorrect) {
        navBtn.classList.add('correct-answer');
      } else {
        navBtn.classList.add('incorrect-answer');
      }
    }
  };

  /**
   * Renders the quiz interface for the current questions.
   */
  const renderQuiz = () => {
    userAnswers = {};
    questionStats = { correct: 0, incorrect: 0, total: 0 };
    
    app.innerHTML = `
            <div id="quiz-screen">
                <div class="quiz-header d-flex justify-content-between align-items-center mb-3">
                    <button class="btn btn-secondary" id="back-to-menu-quiz">Quay lại</button>
                    <button class="btn btn-outline-primary" id="hamburger-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#questionNavOffcanvas">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                    </button>
                </div>
                <div id="quiz-stats" class="mb-3"></div>
                <div id="quiz-content">
                    ${currentQuizQuestions
                      .map(
                        (q, index) => `
                        <div class="quiz-question" id="question-${q.id}">
                            <p>${index + 1}. ${q.question}</p>
                            <div class="options">
                                ${Object.entries(q.options)
                                  .map(
                                    ([key, value]) => `
                                    <label class="option" for="q${q.id}-${key}">
                                        <input type="radio" name="q${q.id}" id="q${q.id}-${key}" value="${key}" style="display:none;">
                                        <b>${key}:</b> ${value}
                                    </label>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
                <button class="btn" id="submit-btn">Nộp bài</button>
            </div>
            <!-- Offcanvas Navigation -->
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

    // Initialize stats
    updateStats();

    const questionNav = document.getElementById("question-nav");
    questionNav.innerHTML = currentQuizQuestions
      .map(
        (q, index) =>
          `<button class="nav-btn btn btn-outline-secondary" data-question-id="${q.id}">${
            index + 1
          }</button>`
      )
      .join("");

    document
      .getElementById("back-to-menu-quiz")
      .addEventListener("click", renderMainMenu);

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const questionId = e.target.dataset.questionId;
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('questionNavOffcanvas'));
        if (offcanvas) {
          offcanvas.hide();
        }
        setTimeout(() => {
          document.getElementById(`question-${questionId}`).scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      });
    });

    const submitBtn = document.getElementById("submit-btn");

    document.querySelectorAll(".options input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const questionId = e.target.name.substring(1);
        const selectedAnswer = e.target.value;
        
        // Show immediate feedback (before updating userAnswers so it can check previous answer)
        showAnswerFeedback(questionId, selectedAnswer);
        
        // Update userAnswers after showing feedback
        userAnswers[questionId] = selectedAnswer;
      });
    });

    submitBtn.addEventListener("click", () => {
      renderResults();
    });
  };

  /**
   * Renders the results summary screen.
   */
  const renderResults = () => {
    let score = 0;
    currentQuizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        score++;
      }
    });
    const incorrect = currentQuizQuestions.length - score;

    app.innerHTML = `
            <div id="result-screen">
                <div class="result-summary">
                    <h2>Hoàn thành!</h2>
                    <p>Số câu đúng: <span class="correct-text">${score}</span></p>
                    <p>Số câu sai: <span class="incorrect-text">${incorrect}</span></p>
                    <div class="result-actions">
                        <button class="btn" id="review-btn">Xem lại bài làm</button>
                        <button class="btn btn-secondary" id="redo-btn">Làm lại bài</button>
                        <button class="btn btn-secondary" id="back-to-menu">Về trang chủ</button>
                    </div>
                </div>
                <div id="answer-review-container" style="display: none;"></div>
            </div>
        `;

    document
      .getElementById("review-btn")
      .addEventListener("click", () => renderAnswerReview());
    document.getElementById("redo-btn").addEventListener("click", () => {
      if (currentQuizFile) {
        startChapterQuiz(currentQuizFile);
      }
    });
    document
      .getElementById("back-to-menu")
      .addEventListener("click", renderMainMenu);
    
    // Show tester modal after completing test
    setTimeout(() => {
      showTesterModal();
    }, 500);
  };

  /**
   * Renders the detailed answer review.
   */
  const renderAnswerReview = () => {
    const reviewContainer = document.getElementById("answer-review-container");
    document.querySelector(".result-summary").style.display = "none"; // Hide summary
    reviewContainer.style.display = "block";

    reviewContainer.innerHTML = `
            <div class="quiz-header">
                <button class="btn btn-secondary" id="back-to-summary-btn">Quay lại kết quả</button>
            </div>
            <h3 style="text-align: center; margin-bottom: 2rem;">Chi tiết bài làm</h3>
            ${currentQuizQuestions
              .map((q, index) => {
                const userAnswer = userAnswers[q.id];
                const isCorrect = userAnswer === q.answer;
                return `
                <div class="quiz-question result-item">
                    <p>${index + 1}. ${q.question}</p>
                    <div class="options">
                        ${Object.entries(q.options)
                          .map(([key, value]) => {
                            let classList = "option";
                            if (key === q.answer) classList += " correct";
                            if (key === userAnswer) classList += " selected";
                            if (key === userAnswer && !isCorrect)
                              classList += " incorrect";

                            return `<div class="${classList}"><b>${key}:</b> ${value}</div>`;
                          })
                          .join("")}
                    </div>
                    ${
                      !userAnswer
                        ? '<p class="no-answer"><i>Bạn chưa trả lời câu này.</i></p>'
                        : ""
                    }
                </div>
                `;
              })
              .join("")}
        `;
    document
      .getElementById("back-to-summary-btn")
      .addEventListener("click", renderResults);
  };

  // Show tester modal
  const showTesterModal = () => {
    const testerModalElement = document.getElementById('testerModal');
    if (testerModalElement) {
      const testerModal = new bootstrap.Modal(testerModalElement);
      testerModal.show();
    }
  };

  // Initial load
  renderMainMenu();
  
  // Show modal after a short delay to ensure Bootstrap is loaded
  setTimeout(() => {
    showTesterModal();
  }, 300);
});
