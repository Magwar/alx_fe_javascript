// Initial quote array
const quotes = [
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time you fall.",
    category: "Life",
  },
  {
    text: "Believe you can and you're halfway there.",
    category: "Motivational",
  },
  {
    text: "The only way to do great work is to love what you do.",
    category: "Inspirational",
  },
  {
    text: "To be or not to be, that is the question.",
    category: "Philosophical",
  },
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

/**
 * Displays a random quote from the 'quotes' array in the 'quoteDisplay' div.
 * This function demonstrates advanced DOM manipulation by creating new
 * HTML elements for the quote text and category, and then appending them.
 */
function showRandomQuote() {
  // Clear any existing content in the quote display area
  quoteDisplay.innerHTML = "";

  // Check if there are any quotes to display
  if (quotes.length === 0) {
    const noQuoteMessage = document.createElement("p");
    noQuoteMessage.textContent = "No quotes available.Please add some!";
    noQuoteMessage.style.fontStyle = "italic";
    quoteDisplay.appendChild(noQuoteMessage);
    return;
  }

  // Get a random index
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Create a paragraph element for the quote text
  const quoteTextElement = document.createElement("p");
  quoteTextElement.textContent = `"${randomQuote.text}"`;
  quoteTextElement.style.fontSize = "1.5em";
  quoteTextElement.style.fontWeight = "bold";
  quoteTextElement.style.marginBottom = "5px";

  // Create a span element for the quote category
  const quoteCategoryElement = document.createElement("span");
  quoteCategoryElement.textContent = `- ${randomQuote.category}`;
  quoteCategoryElement.style.fontSize = "1em";
  quoteCategoryElement.style.color = "#555";

  // Append the created elements to the quote display div
  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(quoteCategoryElement);
}

/**
 * Creates and appends a form for adding new quotes to the document body.
 * This function also handles the logic for adding a new quote to the array
 * and updating the display when the 'Add Quote' button is clicked.
 */

function createAddQuoteForm() {
  // Create a container div for the form elements
  const formContainer = document.createElement("div");
  formContainer.style.marginTop = "20px";
  formContainer.style.padding = "15px";
  formContainer.style.border = "1px solid #ccc";
  formContainer.style.borderRadius = "8px";
  formContainer.style.backgroundColor = "#f9f9f9";
  formContainer.style.display = "flex";
  formContainer.style.flexDirection = "column";
  formContainer.style.gap = "10px";
  formContainer.style.maxWidth = "400px";
  formContainer.style.margin = "20px auto"; // Center the form

  // Create the input field for the new quote text
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText"; // Assign ID as per instructions
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.padding = "8px";
  quoteInput.style.borderRadius = "4px";
  quoteInput.style.border = "1px solid #ddd";

  // Create the input field for the new quote category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory"; // Assign ID as per instructions
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.padding = "8px";
  categoryInput.style.borderRadius = "4px";
  categoryInput.style.border = "1px solid #ddd";

  // Create the 'Add Quote' button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.style.padding = "10px 15px";
  addButton.style.borderRadius = "5px";
  addButton.style.border = "none";
  addButton.style.backgroundColor = "#4CAF50";
  addButton.style.color = "white";
  addButton.style.cursor = "pointer";
  addButton.style.transition = "background-color 0.3s ease";

  // Add a hover effect for the button
  addButton.onmouseover = () => (addButton.style.backgroundColor = "#45a049");
  addButton.onmouseout = () => (addButton.style.backgroundColor = "#4CAF50");

  // Add an event listener to the 'Add Quote' button
  addButton.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();

    // Only add the quote if both fields are not empty
    if (text && category) {
      quotes.push({ text, category }); // Add the new quote to the array
      quoteInput.value = ""; // Clear the input field
      categoryInput.value = ""; // Clear the category field
      showRandomQuote(); // Display a new random quote (could be the newly added one)
    } else {
      // Simple feedback for the user if fields are empty
      alert("Please enter both a quote and a category.");
    }
  });

  // Append all created elements to the form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Append the entire form container to the document body
  document.body.appendChild(formContainer);
}

// --- Initial Setup and Event Listeners ---

// 1. Display an initial random quote when the page loads
window.onload = function () {
  showRandomQuote();
  // 2. Create and display the form for adding new quotes
  createAddQuoteForm();
};

// Add event listener to the "Show New Quote" button
newQuoteBtn.addEventListener("click", showRandomQuote);
