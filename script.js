document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "sunsetdeck_decks_v1";

  const defaultDecks = [
    {
      id: "cs-core",
      name: "CS Fundamentals & Data Structures",
      cards: [
        {
          id: "c1",
          topic: "Algorithms",
          q: "What is the average-case time complexity of Binary Search?",
          a: "O(log n) because each comparison cuts the remaining search interval in half.",
          mastered: false,
        },
        {
          id: "c2",
          topic: "Memory",
          q: "What is internal fragmentation?",
          a: "Wasted memory inside an allocated block when the requested data is smaller than the fixed partition size.",
          mastered: false,
        },
        {
          id: "c3",
          topic: "Data Structures",
          q: "Which data structure follows Last-In, First-Out (LIFO) order?",
          a: "A Stack—pushing adds to the top and popping removes the most recently added element.",
          mastered: false,
        },
        {
          id: "c4",
          topic: "Java",
          q: "Why is StringBuilder often preferred over String concatenation inside loops?",
          a: "String objects are immutable, so repeated '+' concatenation creates extra intermediate objects.",
          mastered: false,
        },
        {
          id: "c5",
          topic: "Web",
          q: "What does localStorage persist data across?",
          a: "Browser refreshes and tab closes until explicitly cleared or deleted by the user/app.",
          mastered: false,
        },
      ],
    },
    {
      id: "web-craft",
      name: "HTML, CSS & JS Craft",
      cards: [
        {
          id: "w1",
          topic: "CSS",
          q: "What does box-sizing: border-box do?",
          a: "Includes padding and border inside an element's declared width and height so layouts stay predictable.",
          mastered: false,
        },
        {
          id: "w2",
          topic: "JavaScript",
          q: "What does event.preventDefault() do on a form submit?",
          a: "Stops the browser's default page reload so JavaScript can handle the submission smoothly.",
          mastered: false,
        },
        {
          id: "w3",
          topic: "HTML",
          q: "Why do we place <script src='script.js' defer></script> in HTML?",
          a: "It downloads the script in parallel and runs it after the HTML document finishes parsing.",
          mastered: false,
        },
      ],
    },
  ];

  let decks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultDecks;
  let currentDeckId = decks[0]?.id || "";
  let currentCardIndex = 0;

  // Mode tabs & views
  const modeTabs = document.querySelectorAll(".mode-tab");
  const views = {
    carousel: document.getElementById("view-carousel"),
    quiz: document.getElementById("view-quiz"),
    builder: document.getElementById("view-builder"),
  };

  // Carousel elements
  const deckSelect = document.getElementById("deck-select");
  const carouselCounter = document.getElementById("carousel-counter");
  const masteredCountEl = document.getElementById("mastered-count");
  const reviewCountEl = document.getElementById("review-count");
  const trackStrip = document.getElementById("carousel-track-strip");
  const flashcard3d = document.getElementById("flashcard-3d");
  const topicBadge = document.getElementById("card-topic-badge");
  const questionText = document.getElementById("card-question-text");
  const answerText = document.getElementById("card-answer-text");
  const prevBtn = document.getElementById("prev-card-btn");
  const nextBtn = document.getElementById("next-card-btn");
  const flipBtn = document.getElementById("flip-btn");
  const markMasteredBtn = document.getElementById("mark-mastered-btn");
  const markReviewBtn = document.getElementById("mark-review-btn");

  // Quiz elements
  const quizSetup = document.getElementById("quiz-setup");
  const quizPlayArea = document.getElementById("quiz-play-area");
  const quizSummary = document.getElementById("quiz-summary");
  const quizLengthSelect = document.getElementById("quiz-length");
  const generateQuizBtn = document.getElementById("generate-quiz-btn");
  const quizProgressLabel = document.getElementById("quiz-progress-label");
  const quizScoreLabel = document.getElementById("quiz-score-label");
  const quizQuestionHeading = document.getElementById("quiz-question-heading");
  const quizChoices = document.getElementById("quiz-choices");
  const quizFeedback = document.getElementById("quiz-feedback");
  const nextQuizBtn = document.getElementById("next-quiz-btn");
  const restartQuizBtn = document.getElementById("restart-quiz-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const finalScoreTitle = document.getElementById("final-score-title");
  const finalScoreMessage = document.getElementById("final-score-message");

  // Builder elements
  const newCardForm = document.getElementById("new-card-form");
  const newQInput = document.getElementById("new-q-input");
  const newAInput = document.getElementById("new-a-input");
  const newTopicInput = document.getElementById("new-topic-input");
  const newDeckForm = document.getElementById("new-deck-form");
  const newDeckName = document.getElementById("new-deck-name");
  const deckCardList = document.getElementById("deck-card-list");

  function saveDecks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }

  function getActiveDeck() {
    return decks.find((d) => d.id === currentDeckId) || decks[0];
  }

  function renderDeckPicker() {
    deckSelect.innerHTML = "";
    decks.forEach((deck) => {
      const opt = document.createElement("option");
      opt.value = deck.id;
      opt.textContent = `${deck.name} (${deck.cards.length})`;
      if (deck.id === getActiveDeck().id) {
        opt.selected = true;
      }
      deckSelect.appendChild(opt);
    });
  }

  function renderCarousel() {
    const deck = getActiveDeck();
    const cards = deck.cards;

    if (!cards.length) {
      carouselCounter.textContent = "0 cards";
      topicBadge.textContent = "Empty Deck";
      questionText.textContent = "No flashcards in this deck yet.";
      answerText.textContent = "Switch to 'Add / Edit Cards' to create your first card.";
      trackStrip.innerHTML = "";
      masteredCountEl.textContent = "0 Mastered";
      reviewCountEl.textContent = "0 To Review";
      return;
    }

    if (currentCardIndex >= cards.length) currentCardIndex = 0;
    if (currentCardIndex < 0) currentCardIndex = cards.length - 1;

    flashcard3d.classList.remove("is-flipped");
    const card = cards[currentCardIndex];

    carouselCounter.textContent = `Card ${currentCardIndex + 1} of${cards.length}`;
    topicBadge.textContent = card.topic || "Study";
    questionText.textContent = card.q;
    answerText.textContent = card.a;

    const masteredTotal = cards.filter((c) => c.mastered).length;
    masteredCountEl.textContent = `${masteredTotal} Mastered`; reviewCountEl.textContent = `${cards.length - masteredTotal} To Review`;

    // Render slide dots
    trackStrip.innerHTML = "";
    cards.forEach((c, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slide-dot";
      if (idx === currentCardIndex) dot.classList.add("active");
      if (c.mastered) dot.classList.add("mastered");
      dot.setAttribute("aria-label", `Go to card ${idx + 1}`); dot.addEventListener("click", () => { currentCardIndex = idx; renderCarousel(); }); trackStrip.appendChild(dot); }); }  function renderCardInventory() { const deck = getActiveDeck(); deckCardList.innerHTML = "";  deck.cards.forEach((c) => { const li = document.createElement("li"); li.className = "inventory-item";  const span = document.createElement("span"); span.textContent = `${c.q}`;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "tiny-del";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        deck.cards = deck.cards.filter((item) => item.id !== c.id);
        saveDecks();
        renderDeckPicker();
        renderCarousel();
        renderCardInventory();
      });

      li.appendChild(span);
      li.appendChild(del);
      deckCardList.appendChild(li);
    });
  }

  function toggleFlip() {
    flashcard3d.classList.toggle("is-flipped");
  }

  flipBtn.addEventListener("click", toggleFlip);
  flashcard3d.addEventListener("click", toggleFlip);
  flashcard3d.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      toggleFlip();
    }
  });

  prevBtn.addEventListener("click", () => {
    currentCardIndex--;
    renderCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentCardIndex++;
    renderCarousel();
  });

  markMasteredBtn.addEventListener("click", () => {
    const deck = getActiveDeck();
    if (!deck.cards.length) return;
    deck.cards[currentCardIndex].mastered = true;
    saveDecks();
    currentCardIndex = (currentCardIndex + 1) % deck.cards.length;
    renderCarousel();
  });

  markReviewBtn.addEventListener("click", () => {
    const deck = getActiveDeck();
    if (!deck.cards.length) return;
    deck.cards[currentCardIndex].mastered = false;
    saveDecks();
    currentCardIndex = (currentCardIndex + 1) % deck.cards.length;
    renderCarousel();
  });

  deckSelect.addEventListener("change", (e) => {
    currentDeckId = e.target.value;
    currentCardIndex = 0;
    renderCarousel();
    renderCardInventory();
    resetQuizPanel();
  });

  // Switch modes
  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetMode = tab.getAttribute("data-mode");
      modeTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      Object.keys(views).forEach((key) => {
        views[key].classList.toggle("active", key === targetMode);
      });
    });
  });

  // Quiz Generator Logic
  let quizQuestions = [];
  let quizIdx = 0;
  let quizScore = 0;

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function resetQuizPanel() {
    quizSetup.classList.remove("hidden");
    quizPlayArea.classList.add("hidden");
    quizSummary.classList.add("hidden");
  }

  function buildQuiz() {
    const deck = getActiveDeck();
    if (deck.cards.length < 2) {
      alert("Add at least 2 cards in this deck to generate a quiz!");
      return;
    }

    const desiredCount = Math.min(Number(quizLengthSelect.value) || 5, deck.cards.length);
    const sampled = shuffleArray(deck.cards).slice(0, desiredCount);

    quizQuestions = sampled.map((card) => {
      const distractors = shuffleArray(
        deck.cards.filter((other) => other.id !== card.id)
      )
        .slice(0, 3)
        .map((d) => d.a);

      const options = shuffleArray([card.a, ...distractors]);
      return {
        prompt: card.q,
        correctAnswer: card.a,
        options,
      };
    });

    quizIdx = 0;
    quizScore = 0;
    quizSetup.classList.add("hidden");
    quizSummary.classList.add("hidden");
    quizPlayArea.classList.remove("hidden");
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const q = quizQuestions[quizIdx];
    quizProgressLabel.textContent = `Question ${quizIdx + 1} of${quizQuestions.length}`;
    quizScoreLabel.textContent = `Score: ${quizScore}`; quizQuestionHeading.textContent = q.prompt; quizFeedback.classList.add("hidden"); nextQuizBtn.classList.add("hidden"); quizChoices.innerHTML = "";  q.options.forEach((optionText) => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "choice-btn"; btn.textContent = optionText;  btn.addEventListener("click", () => { const allChoiceBtns = quizChoices.querySelectorAll(".choice-btn"); allChoiceBtns.forEach((b) => (b.disabled = true));  const isCorrect = optionText === q.correctAnswer; if (isCorrect) { btn.classList.add("correct"); quizScore++; quizScoreLabel.textContent = `Score: ${quizScore}`;
          quizFeedback.textContent = "✨ Spot on! That matches the flashcard answer.";
        } else {
          btn.classList.add("wrong");
          allChoiceBtns.forEach((b) => {
            if (b.textContent === q.correctAnswer) {
              b.classList.add("correct");
            }
          });
          quizFeedback.textContent = `Not quite — highlighted answer: "${q.correctAnswer}"`;
        }

        quizFeedback.classList.remove("hidden");
        nextQuizBtn.classList.remove("hidden");
      });

      quizChoices.appendChild(btn);
    });
  }

  generateQuizBtn.addEventListener("click", buildQuiz);
  restartQuizBtn.addEventListener("click", resetQuizPanel);
  playAgainBtn.addEventListener("click", buildQuiz);

  nextQuizBtn.addEventListener("click", () => {
    quizIdx++;
    if (quizIdx < quizQuestions.length) {
      renderQuizQuestion();
    } else {
      quizPlayArea.classList.add("hidden");
      quizSummary.classList.remove("hidden");
      finalScoreTitle.textContent = `You scored ${quizScore} out of ${quizQuestions.length}`; finalScoreMessage.textContent = quizScore === quizQuestions.length ? "Full marks! You mastered every card in this round." : "Great practice! Review missed cards in the carousel and try another round."; } });  // Builder Forms newCardForm.addEventListener("submit", (e) => { e.preventDefault(); const qVal = newQInput.value.trim(); const aVal = newAInput.value.trim(); const tVal = newTopicInput.value.trim() \vert{}\vert{} "Study"; if (!qVal \vert{}\vert{} !aVal) return;  const deck = getActiveDeck(); deck.cards.push({ id: Date.now().toString(), topic: tVal, q: qVal, a: aVal, mastered: false, });  saveDecks(); renderDeckPicker(); renderCarousel(); renderCardInventory(); newQInput.value = ""; newAInput.value = ""; });  newDeckForm.addEventListener("submit", (e) => { e.preventDefault(); const nameVal = newDeckName.value.trim(); if (!nameVal) return;  const newDeck = { id: `deck-${Date.now()}`,
      name: nameVal,
      cards: [],
    };
    decks.push(newDeck);
    currentDeckId = newDeck.id;
    currentCardIndex = 0;

    saveDecks();
    renderDeckPicker();
    renderCarousel();
    renderCardInventory();
    newDeckName.value = "";
  });

  renderDeckPicker();
  renderCarousel();
  renderCardInventory();
});
