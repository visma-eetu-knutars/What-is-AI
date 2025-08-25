document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const gameContainer = document.getElementById('game-container');
    const questionCard = document.getElementById('question-card');
    const categoryText = document.getElementById('category-text');
    const questionText = document.getElementById('question-text');
    const feedbackText = document.getElementById('feedback-text'); // New element
    const aiBtn = document.getElementById('ai-btn');
    const notAiBtn = document.getElementById('not-ai-btn');
    const answerButtonsContainer = document.getElementById('answer-buttons'); // New reference
    const navigationButtonsContainer = document.getElementById('navigation-buttons'); // New reference
    const nextBtn = document.getElementById('next-btn'); // New element
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
        1: "Kategoria: Näkö",
        2: "Kategoria: Päättely",
        3: "Kategoria: Kuulo",
        4: "Kategoria: Luku",
        5: "Kategoria: Liike"
    };

    /**
     * Fetches and parses questions from the CSV file.
     */
    async function fetchQuestions() {
        try {
            const response = await fetch('questions.csv');
            // Handle potential character encoding issues with Finnish characters
            const data = await response.text(); 
            allQuestions = data.trim().split('\n').map(line => {
                // MODIFIED: Parse 5 columns instead of 3
                const [question, category, answer, correctFeedback, incorrectFeedback] = line.split(';');
                return {
                    question: question.trim(),
                    category: parseInt(category, 10),
                    answer: parseInt(answer, 10),
                    correctFeedback: correctFeedback.trim(),
                    incorrectFeedback: incorrectFeedback.trim()
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
        currentQuestion = currentRoundQuestions[questionsAnswered];

        // Reset UI for the new question
        questionCard.classList.remove('correct', 'incorrect');
        feedbackText.classList.add('hidden'); // Hide feedback text
        navigationButtonsContainer.classList.add('hidden'); // Hide "Next" button
        answerButtonsContainer.classList.remove('hidden'); // Show "AI/NOT AI" buttons
        aiBtn.disabled = false;
        notAiBtn.disabled = false;

        // Update question text
        // categoryText.textContent = `Kategoria: ${categoryMap[currentQuestion.category] || 'Tuntematon'}`;
        questionText.textContent = currentQuestion.question;
    }

    /**
     * Handles the user's answer, updates state, and shows feedback.
     */
    function handleAnswer(userAnswer) {
        aiBtn.disabled = true;
        notAiBtn.disabled = true;

        const isCorrect = (userAnswer === currentQuestion.answer);
        
        if (isCorrect) {
            score++;
            questionCard.classList.add('correct');
            feedbackText.textContent = currentQuestion.correctFeedback;
        } else {
            questionCard.classList.add('incorrect');
            feedbackText.textContent = currentQuestion.incorrectFeedback;
        }
        
        questionsAnswered++;
        updateUI();

        // Show feedback and swap to the "Next Question" button
        feedbackText.classList.remove('hidden');
        answerButtonsContainer.classList.add('hidden');
        navigationButtonsContainer.classList.remove('hidden');
    }

    /**
     * Updates the progress bar and points text.
     */
    function updateUI() {
        const percentage = (questionsAnswered / TOTAL_QUESTIONS_IN_ROUND) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Pisteet: ${score}`;
    }

    function getScoreDescription(finalScore) {
        // (This function remains the same)
        const percentage = (finalScore / TOTAL_QUESTIONS_IN_ROUND) * 100;
        if (percentage === 100) return "Täydellistä! Olet todellinen asiantuntija!";
        if (percentage >= 80) return "Erinomaista työtä! Tunnet todella asiasi.";
        if (percentage >= 60) return "Hyvää työtä! Erittäin vankka tulos.";
        if (percentage >= 40) return "Ei hassumpaa! Olet matkalla asiantuntijaksi.";
        return "Älä lannistu! Jokainen yritys auttaa oppimaan.";
    }

    function showEndScreen() {
        finalScoreEl.textContent = score;
        scoreDescriptionEl.textContent = getScoreDescription(score);
        gameContainer.classList.add('hidden');
        endScreen.classList.remove('hidden');
    }

    function startGame() {
        score = 0;
        questionsAnswered = 0;
        currentRoundQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS_IN_ROUND);

        if (currentRoundQuestions.length < TOTAL_QUESTIONS_IN_ROUND) {
            questionText.textContent = `CSV-tiedostossa ei ole tarpeeksi kysymyksiä uuden ${TOTAL_QUESTIONS_IN_ROUND} kysymyksen kierroksen aloittamiseen.`;
            return;
        }

        updateUI();
        endScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        loadNextQuestion();
    }

    // --- Event Listeners ---
    aiBtn.addEventListener('click', () => handleAnswer(1));
    notAiBtn.addEventListener('click', () => handleAnswer(0));
    playAgainBtn.addEventListener('click', startGame);

    // NEW: Event listener for the "Next Question" button
    nextBtn.addEventListener('click', () => {
        if (questionsAnswered >= TOTAL_QUESTIONS_IN_ROUND) {
            showEndScreen();
        } else {
            loadNextQuestion();
        }
    });

    async function init() {
        await fetchQuestions();
        if (allQuestions.length > 0) {
            startGame();
        }
    }

    init();
});