document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const dataFiles = [
        { name: 'Chương 1-2', file: 'chuong1-2.json' },
        { name: 'Chương 3-4', file: 'chuong3-4.json' },
        { name: 'Chương 5-6', file: 'chuong5-6.json' },
        { name: 'Chương 7-8', file: 'chuong7-8.json' },
        { name: 'Bonus 1', file: 'bonus1.json' },
        { name: 'Bonus 2', file: 'bonus2.json' },
        { name: 'Bonus 3', file: 'bonus3.json' },
    ];

    let currentQuizQuestions = [];
    let userAnswers = {};
    let currentQuizFile = null; // To keep track of the current quiz for the "redo" function

    /**
     * Renders the main menu screen.
     */
    const renderMainMenu = () => {
        app.innerHTML = `
            <div id="selection-screen">
                <h2>Chọn chương để bắt đầu</h2>
                <div class="chapter-list">
                    ${dataFiles.map(df => `<button class="btn" data-file="${df.file}">${df.name}</button>`).join('')}
                </div>
            </div>
        `;

        document.querySelectorAll('.btn[data-file]').forEach(button => {
            button.addEventListener('click', (e) => {
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
     * Renders the quiz interface for the current questions.
     */
    const renderQuiz = () => {
        userAnswers = {};
        app.innerHTML = `
            <div id="quiz-screen">
                <div class="quiz-header">
                     <button class="btn btn-secondary" id="back-to-menu-quiz">Quay lại</button>
                </div>
                <div id="question-nav"></div>
                <div id="quiz-content">
                    ${currentQuizQuestions.map((q, index) => `
                        <div class="quiz-question" id="question-${q.id}">
                            <p>${index + 1}. ${q.question}</p>
                            <div class="options">
                                ${Object.entries(q.options).map(([key, value]) => `
                                    <label class="option" for="q${q.id}-${key}">
                                        <input type="radio" name="q${q.id}" id="q${q.id}-${key}" value="${key}" style="display:none;">
                                        <b>${key}:</b> ${value}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn" id="submit-btn">Nộp bài</button>
            </div>
        `;
        
        const questionNav = document.getElementById('question-nav');
        questionNav.innerHTML = currentQuizQuestions.map((q, index) => 
            `<button class="nav-btn" data-question-id="${q.id}">${index + 1}</button>`
        ).join('');

        document.getElementById('back-to-menu-quiz').addEventListener('click', renderMainMenu);

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questionId = e.target.dataset.questionId;
                document.getElementById(`question-${questionId}`).scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });
        });

        const submitBtn = document.getElementById('submit-btn');

        document.querySelectorAll('.options input').forEach(input => {
            input.addEventListener('change', (e) => {
                const questionId = e.target.name.substring(1);
                userAnswers[questionId] = e.target.value;

                document.querySelectorAll(`input[name="q${questionId}"]`).forEach(radio => {
                    radio.parentElement.classList.remove('selected');
                });
                e.target.parentElement.classList.add('selected');

                const navBtn = document.querySelector(`.nav-btn[data-question-id="${questionId}"]`);
                if (navBtn) {
                    navBtn.classList.add('answered');
                }
            });
        });

        submitBtn.addEventListener('click', () => {
            renderResults();
        });
    };

    /**
     * Renders the results summary screen.
     */
    const renderResults = () => {
        let score = 0;
        currentQuizQuestions.forEach(q => {
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

        document.getElementById('review-btn').addEventListener('click', () => renderAnswerReview());
        document.getElementById('redo-btn').addEventListener('click', () => {
            if (currentQuizFile) {
                startChapterQuiz(currentQuizFile);
            }
        });
        document.getElementById('back-to-menu').addEventListener('click', renderMainMenu);
    };

    /**
     * Renders the detailed answer review.
     */
    const renderAnswerReview = () => {
        const reviewContainer = document.getElementById('answer-review-container');
        document.querySelector('.result-summary').style.display = 'none'; // Hide summary
        reviewContainer.style.display = 'block';

        reviewContainer.innerHTML = `
            <div class="quiz-header">
                <button class="btn btn-secondary" id="back-to-summary-btn">Quay lại kết quả</button>
            </div>
            <h3 style="text-align: center; margin-bottom: 2rem;">Chi tiết bài làm</h3>
            ${currentQuizQuestions.map((q, index) => {
                const userAnswer = userAnswers[q.id];
                const isCorrect = userAnswer === q.answer;
                return `
                <div class="quiz-question result-item">
                    <p>${index + 1}. ${q.question}</p>
                    <div class="options">
                        ${Object.entries(q.options).map(([key, value]) => {
                            let classList = 'option';
                            if (key === q.answer) classList += ' correct';
                            if (key === userAnswer) classList += ' selected';
                            if (key === userAnswer && !isCorrect) classList += ' incorrect';
                            
                            return `<div class="${classList}"><b>${key}:</b> ${value}</div>`;
                        }).join('')}
                    </div>
                    ${!userAnswer ? '<p class="no-answer"><i>Bạn chưa trả lời câu này.</i></p>' : ''}
                </div>
                `
            }).join('')}
        `;
        document.getElementById('back-to-summary-btn').addEventListener('click', renderResults);
    };

    // Initial load
    renderMainMenu();
});