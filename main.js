document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const gameContainer = document.getElementById('game-container');
    const questionCard = document.getElementById('question-card');
    const categoryText = document.getElementById('category-text');
    const questionText = document.getElementById('question-text');
    const trueBtn = document.getElementById('true-btn');
    const falseBtn = document.getElementById('false-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // End Screen Elements
    const endScreen = document.getElementById('end-screen');
    const finalScoreEl = document.getElementById('final-score');
    const scoreDescriptionEl = document.getElementById('score-description');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Game Constants
    const TOTAL_QUESTIONS_IN_ROUND = 10;

    // Game State
    let allQuestions = [];
    let currentRoundQuestions = [];
    let currentQuestion = null;
    let score = 0;
    let questionsAnswered = 0;

    const categoryMap = {
        1: "Can it see?",
        2: "Can it reason?",
        3: "Can it hear?",
        4: "Can it read?",
        5: "Can it move?"
    };

    /**
     * Fetches and parses questions from the CSV file.
     */
    async function fetchQuestions() {
        try {
            const response = await fetch('questions.csv');
            const data = await response.text();
            allQuestions = data.trim().split('\n').map(line => {
                const [question, category, answer] = line.split(';');
                return {
                    question: question.trim(),
                    category: parseInt(category, 10),
                    answer: parseInt(answer, 10)
                };
            }).filter(q => q.question && !isNaN(q.category) && !isNaN(q.answer));
        } catch (error) {
            console.error("Error fetching questions:", error);
            questionText.textContent = "Failed to load questions.";
        }
    }

    /**
     * Selects and displays the next question from the current round's list.
     */
    function loadNextQuestion() {
        // Get the next question from the pre-shuffled list
        currentQuestion = currentRoundQuestions[questionsAnswered];

        // Update the UI
        categoryText.textContent = "Is this AI?"//`Category: ${categoryMap[currentQuestion.category] || 'Unknown'}`;
        questionText.textContent = currentQuestion.question;

        questionCard.classList.remove('correct', 'incorrect');
        trueBtn.disabled = false;
        falseBtn.disabled = false;
    }

    /**
     * Handles the user's answer, updates state, and moves to the next phase.
     */
    function handleAnswer(userAnswer) {
        trueBtn.disabled = true;
        falseBtn.disabled = true;

        const isCorrect = (userAnswer === currentQuestion.answer);

        if (isCorrect) {
            score++;
            questionCard.classList.add('correct');
        } else {
            questionCard.classList.add('incorrect');
        }
        
        questionsAnswered++;
        updateUI();

        // After a delay, decide whether to show the next question or end the game
        setTimeout(() => {
            if (questionsAnswered >= TOTAL_QUESTIONS_IN_ROUND) {
                showEndScreen();
            } else {
                loadNextQuestion();
            }
        }, 1500);
    }

    /**
     * Updates the progress bar and points text.
     */
    function updateUI() {
        // Update progress bar based on questions answered
        const percentage = (questionsAnswered / TOTAL_QUESTIONS_IN_ROUND) * 100;
        progressBar.style.width = `${percentage}%`;

        // Update points counter
        progressText.textContent = `Points: ${score}`;
    }

    /**
     * Returns a descriptive string based on the final score.
     */
    function getScoreDescription(finalScore) {
        const percentage = (finalScore / TOTAL_QUESTIONS_IN_ROUND) * 100;
        if (percentage === 100) return "Perfect job! You're a true expert!";
        if (percentage >= 80) return "Excellent work! You really know your stuff.";
        if (percentage >= 60) return "Good job! A very solid score.";
        if (percentage >= 40) return "Not bad! You're on your way to becoming an expert.";
        return "Don't give up! Every attempt helps you learn.";
    }

    /**
     * Displays the final end screen with score and description.
     */
    function showEndScreen() {
        finalScoreEl.textContent = score;
        scoreDescriptionEl.textContent = getScoreDescription(score);
        gameContainer.classList.add('hidden');
        endScreen.classList.remove('hidden');
    }

    /**
     * Resets the game to its initial state for a new round.
     */
    function startGame() {
        // Reset state
        score = 0;
        questionsAnswered = 0;
        
        // Create a shuffled list of 10 questions for the round
        currentRoundQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS_IN_ROUND);

        if (currentRoundQuestions.length < TOTAL_QUESTIONS_IN_ROUND) {
            questionText.textContent = `Not enough questions in the CSV file to start a new round of ${TOTAL_QUESTIONS_IN_ROUND}.`;
            return;
        }

        updateUI();
        endScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        loadNextQuestion();
    }

    // --- Event Listeners ---
    trueBtn.addEventListener('click', () => handleAnswer(1));
    falseBtn.addEventListener('click', () => handleAnswer(0));
    playAgainBtn.addEventListener('click', startGame);

    /**
     * Main function to initialize the game.
     */
    async function init() {
        await fetchQuestions();
        if (allQuestions.length > 0) {
            startGame();
        }
    }

    init();
});