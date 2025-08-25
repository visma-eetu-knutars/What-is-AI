document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const startScreen = document.getElementById('start-screen'); // Uusi elementti
    const startBtn = document.getElementById('start-btn'); // Uusi elementti
    const gameContainer = document.getElementById('game-container');
    const questionCard = document.getElementById('question-card');
    const categoryText = document.getElementById('category-text');
    const questionText = document.getElementById('question-text');
    const feedbackText = document.getElementById('feedback-text');
    const aiBtn = document.getElementById('ai-btn');
    const notAiBtn = document.getElementById('not-ai-btn');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const navigationButtonsContainer = document.getElementById('navigation-buttons');
    const nextBtn = document.getElementById('next-btn');
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
        1: "Näkö",
        2: "Päättely",
        3: "Kuulo",
        4: "Luku",
        5: "Liike & Sopeutuminen"
    };

    // (fetchQuestions-funktio pysyy samana)
    async function fetchQuestions() {
        try {
            const response = await fetch('questions.csv');
            const data = await response.text();
            allQuestions = data.trim().split('\n').map(line => {
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
            questionText.textContent = "Kysymysten lataaminen epäonnistui.";
        }
    }
    
    // (loadNextQuestion, handleAnswer, updateUI, getScoreDescription, showEndScreen pysyvät samoina)
    function loadNextQuestion() {
        currentQuestion = currentRoundQuestions[questionsAnswered];
        questionCard.classList.remove('correct', 'incorrect');
        feedbackText.classList.add('hidden');
        navigationButtonsContainer.classList.add('hidden');
        answerButtonsContainer.classList.remove('hidden');
        aiBtn.disabled = false;
        notAiBtn.disabled = false;
        //categoryText.textContent = `Kategoria: ${categoryMap[currentQuestion.category] || 'Tuntematon'}`;
        questionText.textContent = currentQuestion.question;
    }

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
        feedbackText.classList.remove('hidden');
        answerButtonsContainer.classList.add('hidden');
        navigationButtonsContainer.classList.remove('hidden');
    }

    function updateUI() {
        const percentage = (questionsAnswered / TOTAL_QUESTIONS_IN_ROUND) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Pisteet: ${score}`;
    }

    function getScoreDescription(finalScore) {
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

    // (startGame-funktio pysyy lähes samana, mutta varmistetaan oikeat näkymät)
    function startGame() {
        score = 0;
        questionsAnswered = 0;
        currentRoundQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS_IN_ROUND);
        if (currentRoundQuestions.length < TOTAL_QUESTIONS_IN_ROUND) {
            questionText.textContent = `CSV-tiedostossa ei ole tarpeeksi kysymyksiä uuden ${TOTAL_QUESTIONS_IN_ROUND} kysymyksen kierroksen aloittamiseen.`;
            return;
        }
        updateUI();
        // Varmistetaan, että oikeat ruudut ovat näkyvissä/piilossa
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        loadNextQuestion();
    }

    // --- Event Listeners ---
    // UUSI: Kuuntelija aloituspainikkeelle
    startBtn.addEventListener('click', startGame);
    
    aiBtn.addEventListener('click', () => handleAnswer(1));
    notAiBtn.addEventListener('click', () => handleAnswer(0));
    playAgainBtn.addEventListener('click', () => {
        // Kun pelataan uudestaan, voidaan näyttää aloitusruutu uudelleen
        endScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });
    nextBtn.addEventListener('click', () => {
        if (questionsAnswered >= TOTAL_QUESTIONS_IN_ROUND) {
            showEndScreen();
        } else {
            loadNextQuestion();
        }
    });

    // MUOKATTU: init-funktio vain lataa kysymykset, ei käynnistä peliä
    async function init() {
        await fetchQuestions();
        // Varmistetaan, että kysymykset ovat ladattu ennen kuin käyttäjä voi aloittaa
        if (allQuestions.length > 0) {
            startBtn.disabled = false;
        } else {
            startBtn.textContent = "Virhe ladatessa";
        }
    }
    
    // Estetään pelin aloitus ennen kuin kysymykset on ladattu
    startBtn.disabled = true; 
    init();
});