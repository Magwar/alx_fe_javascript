// Initial quote array - will be overwritten by local storage if data exists
let quotes = [
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
const addQuoteFormContainer = document.getElementById("addQuoteFormContainer"); // New container for the form
const exportQuotesBtn = document.getElementById("exportQuotesBtn"); // New button for export
const importFile = document.getElementById("importFile"); // File input for import
const messageBox = document.getElementById("messageBox"); // Message box for user feedback

/**
 * Displays a temporary message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' to influence styling (though basic here).
 */

function showMessage(message, type = "success") {
  messageBox.textContent = message;
  // Add classes for styling if needed, e.g., messageBox.className = `message-box ${type}`;
  messageBox.classList.add("show");
  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000); // Hide after 3 seconds
}

/**
 * Saves the current 'quotes' array to local storage.
 * Local storage persists data even when the browser is closed.
 */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  console.log("Quotes saved to local storage.");
}

/**
 * Loads quotes from local storage. If no quotes are found in local storage,
 * it returns the initial default quotes.
 * @returns {Array<Object>} The quotes array from local storage or default.
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    try {
      // Parse the JSON string back into a JavaScript array
      quotes = JSON.parse(storedQuotes);
      console.log("Quotes loaded from local storage.");
    } catch (e) {
      console.error("Error parsing stored quotes from local storage:", e);
      // If parsing fails, revert to default quotes
      quotes = [
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
    }
  }
  // If no stored quotes, 'quotes' array remains as its initial default
}

/**
 * Saves the last viewed quote to session storage.
 * Session storage persists only for the duration of the browser tab/window session.
 * @param {Object} quote - The quote object to save.
 */
function saveLastViewedQuote(quote) {
  if (quote) {
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
    console.log("Last viewed quote saved to session storage.");
  } else {
    sessionStorage.removeItem("lastViewedQuote");
    console.log("Last viewed quote cleared from session storage.");
  }
}

/**
 * Loads the last viewed quote from session storage.
 * @returns {Object|null} The last viewed quote object, or null if not found.
 */
function loadLastViewedQuote() {
  const storedLastQuote = sessionStorage.getItem("lastViewedQuote");
  if (storedLastQuote) {
    try {
      return JSON.parse(storedLastQuote);
    } catch (e) {
      console.error("Error parsing last viewed quote from session storage:", e);
      return null;
    }
  }
  return null;
}

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
    noQuoteMessage.textContent = "No quotes available. Add some!";
    noQuoteMessage.style.fontStyle = "italic";
    quoteDisplay.appendChild(noQuoteMessage);
    // Save null to session storage if no quotes are displayed
    saveLastViewedQuote(null);
    return;
  }

  // Get a random index
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Save the currently displayed quote to session storage
  saveLastViewedQuote(randomQuote);

  // Create a paragraph element for the quote text
  const quoteTextElement = document.createElement("p");
  quoteTextElement.textContent = `"${randomQuote.text}"`;

  // Create a span element for the quote category
  const quoteCategoryElement = document.createElement("span");
  quoteCategoryElement.textContent = `- ${randomQuote.category}`;

  // Append the created elements to the quote display div
  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(quoteCategoryElement);
}

/**
 * Creates and appends a form for adding new quotes to the specified container.
 * This function also handles the logic for adding a new quote to the array,
 * saving it to local storage, and updating the display.
 */
function createAddQuoteForm() {
  // Create a container div for the form elements
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container"); // Apply class for styling

  // Create the input field for the new quote text
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  // Create the input field for the new quote category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  // Create the 'Add Quote' button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

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
      saveQuotes(); // Save updated quotes to local storage
      quoteInput.value = ""; // Clear the input field
      categoryInput.value = ""; // Clear the category field
      showRandomQuote(); // Display a new random quote (could be the newly added one)
      showMessage("Quote added successfully!"); // User feedback
    } else {
      showMessage("Please enter both a quote and a category.", "error");
    }
  });

  // Append all created elements to the form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Append the entire form container to its designated container in HTML
  addQuoteFormContainer.appendChild(formContainer);
}

/**
 * Exports the current 'quotes' array as a JSON file for download.
 * Uses Blob and URL.createObjectURL for client-side file generation.
 */
function exportQuotes() {
  if (quotes.length === 0) {
    showMessage("No quotes to export!", "error");
    return;
  }
  // Convert the quotes array to a JSON string
  const dataStr = JSON.stringify(quotes, null, 2); // null, 2 for pretty printing

  // Create a Blob from the JSON string with the correct MIME type
  const blob = new Blob([dataStr], { type: "application/json" });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json"; // Set the download filename
  document.body.appendChild(a); // Append to body to make it clickable

  // Programmatically click the anchor element to trigger download
  a.click();

  // Clean up: remove the anchor element and revoke the object URL
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showMessage("Quotes exported successfully!");
}

/**
 * Handles importing quotes from a JSON file selected by the user.
 * Reads the file, parses JSON, updates quotes array and local storage accordingly.
 * @param {Event} event - The file input change event.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0]; // Get the selected file
  if (!file) {
    showMessage("No file selected.", "error");
    return;
  }

  const fileReader = new FileReader(); // Create a FileReader object

  // Define what happens when the file is successfully read
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result); // Parse the JSON string
      // Basic validation: ensure it's an array and items have 'text' and 'category'
      if (
        Array.isArray(importedQuotes) &&
        importedQuotes.every(
          (q) => typeof q.text === "string" && typeof q.category === "string"
        )
      ) {
        // Use spread operator (...) to add all imported quotes to the existing array
        quotes.push(...importedQuotes);
        saveQuotes(); // Save the combined quotes to local storage
        showRandomQuote(); // Update the display
        showMessage("Quotes imported successfully!");
      } else {
        showMessage(
          "Invalid JSON file format. Expected an array of quote objects.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error importing quotes:", error);
      showMessage(
        "Error importing quotes. Make sure it's a valid JSON file.",
        "error"
      );
    }
  };

  // Define what happens if there's an error reading the file
  fileReader.onerror = function () {
    showMessage("Error reading file.", "error");
  };

  // Read the file as text
  fileReader.readAsText(file);
}

// --- Initial Setup and Event Listeners ---

// This ensures the DOM is fully loaded before our script runs
window.onload = function () {
  loadQuotes(); // Load quotes from local storage first
  createAddQuoteForm(); // Create and add the new quote form

  // Try to load and display the last viewed quote from session storage
  const lastQuote = loadLastViewedQuote();
  if (lastQuote) {
    // If a last viewed quote exists, display it directly
    // We need to clear and append elements, similar to showRandomQuote
    quoteDisplay.innerHTML = ""; // Clear existing content
    const quoteTextElement = document.createElement("p");
    quoteTextElement.textContent = `"${lastQuote.text}"`;
    const quoteCategoryElement = document.createElement("span");
    quoteCategoryElement.textContent = `- ${lastQuote.category}`;
    quoteDisplay.appendChild(quoteTextElement);
    quoteDisplay.appendChild(quoteCategoryElement);
  } else {
    // If no last viewed quote, show a random one
    showRandomQuote();
  }
};

// Add event listener to the "Show New Quote" button
newQuoteBtn.addEventListener("click", showRandomQuote);

// Add event listener for the Export button
exportQuotesBtn.addEventListener("click", exportQuotes);

// Add event listener for the Import file input
importFile.addEventListener("change", importFromJsonFile);
