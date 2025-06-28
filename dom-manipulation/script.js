// Initial quote array
const quotes = [
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time you fall.",
    category: "Life",
  },
  {
    text: "Believe you can and you're halfway there.",
    category: "motivational",
  },
  {
    text: "The only way to do great work is to love what you do.",
    category: "inspirational",
    },
    {
        text: "To be or not to be, that is the question.",
        category: "philosophical",
  }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");


// const quoteInput = document.getElementById("newQuoteText");
// const categoryInput = document.getElementById("newQuoteCategory");

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
}

// Function to create a form for adding new quotes
function createAddQuoteForm() {
    const container = document.createElement("div");

    const quoteInput = document.createElement("input");
    quoteInput.placeholder = "Quote text";
    quoteInput.style.marginRight = "10px";

    const categoryInput = document.createElement("input");
    categoryInput.placeholder = "Category";
    categoryInput.style.marginRight = "10px";

    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";

    addButton.addEventListener("click", () => {
        const text = quoteInput.value.trim();
        const category = categoryInput.value.trim();

        if (text && category) {
            quotes.push({ text, category });
            quoteInput.value = "";
            categoryInput.value = "";
            showRandomQuote(); //Show the new quote immediately
        }
    });

    container.appendChild(quoteInput);
    container.appendChild(categoryInput);
    container.appendChild(addButton);
    document.body.appendChild(container);
}

//Initial step
showRandomQuote();
createAddQuoteForm();
newQuoteBtn.addEventListener("click", showRandomQuote);