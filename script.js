document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "sunsetdeck_v2_data";

  const starterDecks = [
    {
      id: "deck-dsa",
      name: "Data Structures & Algorithms",
      cards: [
        {
          id: "1",
          tag: "Binary Search",
          q: "What is the time complexity of Binary Search on a sorted array of n items?",
          a: "O(log n), because each step eliminates half of the remaining search space.",
          mastered: false,
        },
        {
          id: "2",
          tag: "Stack",
          q: "Which principle does a Stack follow?",
          a: "LIFO (Last-In, First-Out): the last item pushed is the first item popped.",
          mastered: false,
        },
        {
          id: "3",
          tag: "Queue",
          q: "Which principle does a Queue follow?",
          a: "FIFO (First-In, First-Out): items enter at the rear and leave from the front.",
          mastered: false,
        },
        {
          id: "4",
          tag: "Trees",
          q: "In a Binary Search Tree, where are smaller keys placed relative to a node?",
          a: "In the left subtree, while larger keys are placed in the right subtree.",
          mastered: false,
        },
        {
          id: "5",
          tag: "Recursion",
          q: "Why does every recursive function need a base case?",
          a: "To stop recursive calls from continuing infinitely and causing a stack overflow.",
          mastered: false,
        },
      ],
    },
    {
      id: "deck-web",
      name: "HTML, CSS & JavaScript",
      cards: [
        {
          id: "w1",
          tag: "CSS",
          q: "What does box-sizing: border-box do?",
          a: "Keeps padding and border inside an element's specified width and height.",
          mastered: false,
        },
        {
          id: "w2",
          tag: "JS",
          q: "What does localStorage store?",
          a: "Key-value strings in the browser that stay saved across page reloads.",
          mastered: false,
        },
        {
          id: "w3",
          tag: "HTML",
          q: "What does the defer attribute do on a script tag?",
          a: "Loads the script during HTML parsing and runs it once the DOM is ready.",
          mastered: false,
        },
      ],
    },
  ];

  let decks;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    decks = Array.isArray(parsed) && parsed.length > 0 ? parsed : starterDecks;
  } catch {
    decks = starterDecks;
  }

  let activeDeckId = decks[0].id;
  let slideIndex = 0;
  let isFlipped = false;

  // DOM references
  const deckSelector = document.getElementById("deck-selector");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const viewPanels = {
    carousel: document.getElementById("view-carousel"),
    quiz: document.getElementById("view-quiz"),
    manage: document.getElementById("view-manage"),
  };

  const cardPosition = document.getElementById("card-position");
  const masteredBadge = document.getElementById("mastered-badge");
  const reviewBadge = document.getElementById("review-badge");
  const slideDots = document.getElementById("slide-dots");
  const flashcardBox = document.getElementById("flashcard-box");
  const cardTag = document.getElementById("card-tag");
  const cardSideLabel = document.getElementById("card-side-label");
  const cardMainContent = document.getElementById("card-main-content");

  const prevSlideBtn = document.getElementById("prev-slide");
  const nextSlideBtn = document.getElementById("next-slide");
  const btnFlip = document.getElementById("btn-flip");
  const btnMastered = document.getElementById("btn-mastered");
  const btnReview = document.getElementById("btn-review");

  // Quiz DOM
  const quizStartCard = document.getElementById("quiz-start-card");
  const quizActiveCard = document.getElementById("quiz-active-card");
  const quizDoneCard = document.getElementById("quiz-done-card");
  const quizCountSelect = document.getElementById("quiz-count");
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const quizStepLabel = document.getElementById("quiz-step-label");
  const quizScoreBadge = document.getElementById("quiz-score-badge");
  const quizPrompt = document.getElementById("quiz-prompt");
  const quizOptions = document.getElementById("quiz-options");
  const quizResultNote = document.getElementById("quiz-result-note");
  const nextQBtn = document.getElementById("next-q-btn");
  const backSetupBtn = document.getElementById("back-setup-btn");
  const retryQuizBtn = document.getElementById("retry-quiz-btn");
  const quizFinalHeading = document.getElementById("quiz-final-heading");
  const quizFinalSub = document.getElementById("quiz-final-sub");

  // Manage DOM
  const addCardForm = document.getElementById("add-card-form");
  const inputQ = document.getElementById("input-q");
  const inputA = document.getElementById("input-a");
  const inputTag = document.getElementById("input-tag");
  const addDeckForm = document.getElementById("add-deck-form");
  const inputDeckName = document.getElementById("input-deck-name");
  const cardManagerList = document.getElementById("card-manager-list");

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }

  function currentDeck() {
    return decks.find((d) => d.id === activeDeckId) || decks[0];
  }

  function populateDeckDropdown() {
    deckSelector.innerHTML = "";
    const active = currentDeck();
    decks.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.id;
      option.textContent = `${d.name} (${d.cards.length})`;
      option.selected = d.id === active.id;
      deckSelector.appendChild(option);
    });
  }

  function renderCarousel() {
    const deck = currentDeck();
    const cards = deck.cards;

    if (!cards.length) {
      cardPosition.textContent = "0 cards";
      masteredBadge.textContent = "0 Mastered";
      reviewBadge.textContent = "0 To Review";
      slideDots.innerHTML = "";
      cardTag.textContent = "Empty";
      cardSideLabel.textContent = "NO CARDS";
      cardMainContent.textContent = "This deck has no cards yet. Open 'Add Cards' to add one.";
      flashcardBox.classList.remove("flipped");
      return;
    }

    if (slideIndex >= cards.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = cards.length - 1;

    const card = cards[slideIndex];
    const masteredCount = cards.filter((c) => c.mastered).length;

    cardPosition.textContent = `Card ${slideIndex + 1} of ${cards.length}`;
    masteredBadge.textContent = `${masteredCount} Mastered`;
    reviewBadge.textContent = `${cards.length - masteredCount} To Review`;
    cardTag.textContent = card.tag || "Study";

    flashcardBox.classList.toggle("flipped", isFlipped);
    if (isFlipped) {
      cardSideLabel.textContent = "ANSWER • Click to flip back";
      cardMainContent.textContent = card.a;
    } else {
      cardSideLabel.textContent = "QUESTION • Click to reveal answer";
      cardMainContent.textContent = card.q;
    }

    slideDots.innerHTML = "";
    cards.forEach((c, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot-btn";
      if (idx === slideIndex) dot.classList.add("active");
      if (c.mastered) dot.classList.add("done");
      dot.setAttribute("aria-label", `Jump to card ${idx + 1}`);
      dot.addEventListener("click", () => {
        slideIndex = idx;
        isFlipped = false;
        renderCarousel();
      });
      slideDots.appendChild(dot);
    });
  }

  function renderManagerList() {
    const deck = currentDeck();
    cardManagerList.innerHTML = "";

    deck.cards.forEach((c) => {
      const li = document.createElement("li");
      li.className = "manager-item";

      const text = document.createElement("span");
      text.textContent = c.q;

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "del-small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        deck.cards = deck.cards.filter((item) => item.id !== c.id);
        persist();
        populateDeckDropdown();
        renderCarousel();
        renderManagerList();
      });

      li.appendChild(text);
      li.appendChild(delBtn);
      cardManagerList.appendChild(li);
    });
  }

  function flipCurrentCard() {
    if (!currentDeck().cards.length) return;
    isFlipped = !isFlipped;
    renderCarousel();
  }

  flashcardBox.addEventListener("click", flipCurrentCard);
  btnFlip.addEventListener("click", flipCurrentCard);
  flashcardBox.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      flipCurrentCard();
    }
  });

  prevSlideBtn.addEventListener("click", () => {
    slideIndex--;
    isFlipped = false;
    renderCarousel();
  });

  nextSlideBtn.addEventListener("click", () => {
    slideIndex++;
    isFlipped = false;
    renderCarousel();
  });

  btnMastered.addEventListener("click", () => {
    const cards = currentDeck().cards;
    if (!cards.length) return;
    cards[slideIndex].mastered = true;
    persist();
    slideIndex = (slideIndex + 1) % cards.length;
    isFlipped = false;
    renderCarousel();
  });

  btnReview.addEventListener("click", () => {
    const cards = currentDeck().cards;
    if (!cards.length) return;
    cards[slideIndex].mastered = false;
    persist();
    slideIndex = (slideIndex + 1) % cards.length;
    isFlipped = false;
    renderCarousel();
  });

  deckSelector.addEventListener("change", (e) => {
    activeDeckId = e.target.value;
    slideIndex = 0;
    isFlipped = false;
    renderCarousel();
    renderManagerList();
    showQuizSetup();
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view");
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.keys(viewPanels).forEach((k) => {
        viewPanels[k].classList.toggle("active", k === target);
      });
    });
  });

  // Quiz Engine
  let questions = [];
  let qIndex = 0;
  let score = 0;

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showQuizSetup() {
    quizStartCard.classList.remove("hidden");
    quizActiveCard.classList.add("hidden");
    quizDoneCard.classList.add("hidden");
  }

  function launchQuiz() {
    const cards = currentDeck().cards;
    if (cards.length < 2) {
      alert("Add at least 2 flashcards in this deck to generate a quiz.");
      return;
    }

    const totalQ = Math.min(Number(quizCountSelect.value) || 5, cards.length);
    questions = shuffle(cards).slice(0, totalQ).map((card) => {
      const wrongChoices = shuffle(cards.filter((c) => c.id !== card.id))
        .slice(0, 3)
        .map((c) => c.a);

      return {
        prompt: card.q,
        answer: card.a,
        choices: shuffle([card.a, ...wrongChoices]),
      };
    });

    qIndex = 0;
    score = 0;
    quizStartCard.classList.add("hidden");
    quizDoneCard.classList.add("hidden");
    quizActiveCard.classList.remove("hidden");
    renderQuestion();
  }

  function renderQuestion() {
    const item = questions[qIndex];
    quizStepLabel.textContent = `Question ${qIndex + 1} of ${questions.length}`;
    quizScoreBadge.textContent = `Score: ${score}`;
    quizPrompt.textContent = item.prompt;
    quizResultNote.classList.add("hidden");
    nextQBtn.classList.add("hidden");
    quizOptions.innerHTML = "";

    item.choices.forEach((choiceText) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-btn";
      btn.textContent = choiceText;

      btn.addEventListener("click", () => {
        const allBtns = quizOptions.querySelectorAll(".opt-btn");
        allBtns.forEach((b) => (b.disabled = true));

        if (choiceText === item.answer) {
          btn.classList.add("right-choice");
          score++;
          quizScoreBadge.textContent = `Score: ${score}`;
          quizResultNote.textContent = "Correct answer!";
        } else {
          btn.classList.add("wrong-choice");
          allBtns.forEach((b) => {
            if (b.textContent === item.answer) {
              b.classList.add("right-choice");
            }
          });
          quizResultNote.textContent = `Correct answer: ${item.answer}`;
        }

        quizResultNote.classList.remove("hidden");
        nextQBtn.classList.remove("hidden");
      });

      quizOptions.appendChild(btn);
    });
  }

  startQuizBtn.addEventListener("click", launchQuiz);
  retryQuizBtn.addEventListener("click", launchQuiz);
  backSetupBtn.addEventListener("click", showQuizSetup);

  nextQBtn.addEventListener("click", () => {
    qIndex++;
    if (qIndex < questions.length) {
      renderQuestion();
    } else {
      quizActiveCard.classList.add("hidden");
      quizDoneCard.classList.remove("hidden");
      quizFinalHeading.textContent = `Score: ${score} / ${questions.length}`;
      quizFinalSub.textContent =
        score === questions.length
          ? "Perfect round! You answered every question right."
          : "Good practice session! Flip through your deck or try another quiz.";
    }
  });

  // Add card & deck
  addCardForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = inputQ.value.trim();
    const a = inputA.value.trim();
    const tag = inputTag.value.trim() || "Study";
    if (!q || !a) return;

    currentDeck().cards.push({
      id: Date.now().toString(),
      tag,
      q,
      a,
      mastered: false,
    });

    persist();
    populateDeckDropdown();
    renderCarousel();
    renderManagerList();
    inputQ.value = "";
    inputA.value = "";
    inputQ.focus();
  });

  addDeckForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = inputDeckName.value.trim();
    if (!name) return;

    const newDeck = {
      id: `deck-${Date.now()}`,
      name,
      cards: [],
    };
    decks.push(newDeck);
    activeDeckId = newDeck.id;
    slideIndex = 0;
    isFlipped = false;

    persist();
    populateDeckDropdown();
    renderCarousel();
    renderManagerList();
    inputDeckName.value = "";
  });

  populateDeckDropdown();
  renderCarousel();
  renderManagerList();
});
