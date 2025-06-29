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

// Global variable to store the current filter setting (RENAMED from currentCategoryFilter)
let selectedCategory = "all"; // Default filter is 'all'

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");
const exportQuotesBtn = document.getElementById("exportQuotesBtn");
const importFile = document.getElementById("importFile");
const messageBox = document.getElementById("messageBox");
const categoryFilterDropdown = document.getElementById("categoryFilter");

/**
 * Displays a temporary message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' to influence styling.
 */
function showMessage(message, type = "success") {
  messageBox.textContent = message;
  messageBox.classList.remove("success", "error"); // Clear previous types
  messageBox.classList.add(type); // Add new type
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
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
      console.log("Quotes loaded from local storage.");
    } catch (e) {
      console.error("Error parsing stored quotes from local storage:", e);
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
      showMessage("Error loading saved quotes. Using default quotes.", "error");
    }
  }
}

/**
 * Saves the last viewed quote to session storage.
 * Session storage persists only for the duration of the browser tab/window session.
 * @param {Object} quote - The quote object to save.
 */
function saveLastViewedQuote(quote) {
  if (quote) {
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
    console.log("Last viewed quote saved to session storage:", quote.text);
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
 * Helper function: Renders a single quote object into the quoteDisplay div.
 * This centralizes the display logic.
 * @param {Object} quote - The quote object to render.
 */
function renderQuote(quote) {
  quoteDisplay.innerHTML = ""; // Clear existing content

  const quoteTextElement = document.createElement("p");
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement("span");
  quoteCategoryElement.textContent = `- ${quote.category}`;

  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(quoteCategoryElement);

  saveLastViewedQuote(quote); // Save the rendered quote to session storage
}

/**
 * Helper function: Returns a filtered array of quotes based on the selectedCategory.
 * @returns {Array<Object>} An array of quotes matching the current filter.
 */
function getFilteredQuotes() {
  if (selectedCategory === "all") {
    // USED selectedCategory
    return quotes;
  } else {
    return quotes.filter((quote) => quote.category === selectedCategory); // USED selectedCategory
  }
}

/**
 * Displays a random quote from the currently filtered quotes array.
 * Uses the renderQuote helper.
 */
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "";
    const noQuoteMessage = document.createElement("p");
    noQuoteMessage.textContent = `No quotes found for category: "${selectedCategory}". Please add some!`; // USED selectedCategory
    noQuoteMessage.style.fontStyle = "italic";
    quoteDisplay.appendChild(noQuoteMessage);
    saveLastViewedQuote(null); // Clear session storage if no filtered quotes
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  renderQuote(randomQuote); // Use the helper to display and save to session storage
}

/**
 * Populates the category filter dropdown with unique categories from the quotes array.
 */
function populateCategories() {
  // Start with a Set to automatically get unique categories
  const uniqueCategories = new Set(quotes.map((quote) => quote.category));

  // Convert Set to Array and sort alphabetically
  const sortedCategories = Array.from(uniqueCategories).sort();

  // Clear existing options in the dropdown
  categoryFilterDropdown.innerHTML = "";

  // Add the "All Categories" option first
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilterDropdown.appendChild(allOption);

  // Add unique categories as options
  sortedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  // Set the dropdown to the currently active filter, or 'all' if the filter is no longer available
  if (
    !sortedCategories.includes(selectedCategory) &&
    selectedCategory !== "all"
  ) {
    // USED selectedCategory
    selectedCategory = "all"; // USED selectedCategory - Reset filter if category no longer exists
    showMessage(
      'Selected category no longer exists, filter reset to "All Categories".',
      "error"
    );
  }
  categoryFilterDropdown.value = selectedCategory; // USED selectedCategory
  saveCategoryFilter(); // Save the updated filter to local storage
}

/**
 * Filters quotes based on the selected category from the dropdown.
 * This function is called when the dropdown value changes.
 */
function filterQuotes() {
  selectedCategory = categoryFilterDropdown.value; // USED selectedCategory - Update global filter variable
  saveCategoryFilter(); // Save the selected filter to local storage
  showRandomQuote(); // Display a random quote from the newly filtered set
}

/**
 * Saves the current category filter to local storage.
 */
function saveCategoryFilter() {
  localStorage.setItem("selectedCategory", selectedCategory); // USED selectedCategory
  console.log("Category filter saved:", selectedCategory); // USED selectedCategory
}

/**
 * Loads the saved category filter from local storage.
 * @returns {string} The saved filter, or 'all' if none found.
 */
function loadCategoryFilter() {
  const savedFilter = localStorage.getItem("selectedCategory"); // USED selectedCategory
  if (savedFilter) {
    selectedCategory = savedFilter; // USED selectedCategory
    console.log("Category filter loaded:", selectedCategory); // USED selectedCategory
  } else {
    selectedCategory = "all"; // USED selectedCategory
    console.log('No category filter found, defaulting to "all".');
  }
}

/**
 * Creates and appends a form for adding new quotes.
 * Saves quotes to local storage after adding a new one and uses custom messages.
 * Also updates categories dropdown if a new category is introduced.
 */
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.onmouseover = () => (addButton.style.backgroundColor = "#45a049");
  addButton.onmouseout = () => (addButton.style.backgroundColor = "#4CAF50");

  addButton.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();

    if (text && category) {
      quotes.push({ text, category });
      saveQuotes(); // Save updated quotes to local storage
      populateCategories(); // Update categories dropdown
      categoryFilterDropdown.value = category; // Set filter dropdown to new category
      selectedCategory = category; // USED selectedCategory - Update global filter variable
      saveCategoryFilter(); // Save this new category filter to local storage

      quoteInput.value = "";
      categoryInput.value = "";
      showRandomQuote(); // Show a random quote from the (potentially new) filtered set
      showMessage("Quote added successfully!");
    } else {
      showMessage("Please enter both a quote and a category.", "error");
    }
  });

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  addQuoteFormContainer.appendChild(formContainer);
}

/**
 * Exports the current 'quotes' array as a JSON file for download.
 */
function exportQuotes() {
  if (quotes.length === 0) {
    showMessage("No quotes to export!", "error");
    return;
  }
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showMessage("Quotes exported successfully!");
}

/**
 * Handles importing quotes from a JSON file selected by the user.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    showMessage("No file selected for import.", "error");
    return;
  }

  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (
        Array.isArray(importedQuotes) &&
        importedQuotes.every(
          (q) => typeof q.text === "string" && typeof q.category === "string"
        )
      ) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // Update categories dropdown after import
        showRandomQuote();
        showMessage("Quotes imported successfully!");
      } else {
        showMessage(
          'Invalid JSON file format. Expected an array of quote objects with "text" and "category".',
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

  fileReader.onerror = function () {
    showMessage("Error reading file.", "error");
  };

  fileReader.readAsText(file);
}

// --- Initial Setup and Event Listeners ---

window.onload = function () {
  loadQuotes(); // 1. Load quotes from local storage
  loadCategoryFilter(); // 2. Load saved category filter
  populateCategories(); // 3. Populate dropdown with categories (from loaded quotes)
  createAddQuoteForm(); // 4. Create and add the new quote form

  // 5. Try to load and display the last viewed quote from session storage,
  //    but ensure it respects the current filter.
  const lastQuote = loadLastViewedQuote();
  const filteredQuotes = getFilteredQuotes();

  if (
    lastQuote &&
    filteredQuotes.some(
      (q) => q.text === lastQuote.text && q.category === lastQuote.category
    )
  ) {
    // If last viewed quote exists AND is in the currently filtered set, display it
    renderQuote(lastQuote);
  } else {
    // Otherwise, show a random quote from the currently filtered set
    showRandomQuote();
  }
};

// Add event listener to the "Show New Quote" button
newQuoteBtn.addEventListener("click", showRandomQuote);

// Add event listener for the Export button
exportQuotesBtn.addEventListener("click", exportQuotes);

// Add event listener for the Import file input
importFile.addEventListener("change", importFromJsonFile);

// The categoryFilterDropdown has its onchange attribute directly in HTML: onchange="filterQuotes()"
