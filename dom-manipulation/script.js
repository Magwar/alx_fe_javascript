// Initial quote array - will be overwritten by local storage if data exists
let quotes = [
  {
    id: "q1",
    text: "The greatest glory in living lies not in never falling, but in rising every time you fall.",
    category: "Life",
  },
  {
    id: "q2",
    text: "Believe you can and you're halfway there.",
    category: "Motivational",
  },
  {
    id: "q3",
    text: "The only way to do great work is to love what you do.",
    category: "Inspirational",
  },
  {
    id: "q4",
    text: "To be or not to be, that is the question.",
    category: "Philosophical",
  },
];

// Global variables for filter and sync status
let selectedCategory = "all"; // Default filter is 'all'
let isSyncing = false; // Flag to prevent multiple concurrent sync operations
const SYNC_INTERVAL = 10000; // Sync every 10 seconds (for demonstration)

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");
const exportQuotesBtn = document.getElementById("exportQuotesBtn");
const importFile = document.getElementById("importFile");
const messageBox = document.getElementById("messageBox");
const categoryFilterDropdown = document.getElementById("categoryFilter");
const syncStatusElement = document.getElementById("syncStatus"); // NEW: For displaying sync status
const manualSyncBtn = document.getElementById("manualSyncBtn"); // NEW: Manual Sync Button

/**
 * Displays a temporary message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', 'info'.
 */
function showMessage(message, type = "info") {
  messageBox.textContent = message;
  messageBox.classList.remove("success", "error", "info"); // Clear previous types
  messageBox.classList.add(type); // Add new type
  messageBox.classList.add("show");
  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000); // Hide after 3 seconds
}

/**
 * Displays persistent sync status message.
 * @param {string} message - The status message.
 * @param {string} type - 'success', 'error', 'pending', or default (no special styling).
 */
function updateSyncStatus(message, type = "") {
  syncStatusElement.textContent = `Sync Status: ${message}`;
  syncStatusElement.classList.remove("success", "error", "pending");
  if (type) {
    syncStatusElement.classList.add(type);
  }
}

/**
 * Helper: Generates a simple unique ID (for mock server use).
 * In a real app, IDs would come from the server/database.
 */
function generateUniqueId() {
  return "q" + Date.now() + Math.random().toString(36).substring(2, 9);
}

/**
 * Fetches quotes from JSONPlaceholder API.
 * This simulates receiving updates from a server.
 * @returns {Promise<Array<Object>>} A promise that resolves with the fetched quotes.
 */
async function fetchQuotesFromServer() {
  // Function for fetching quotes from a server
  updateSyncStatus("Fetching from JSONPlaceholder...", "pending");
  try {
    // Fetch up to 10 posts from JSONPlaceholder
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=10"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Map JSONPlaceholder post structure to our quote structure
    // JSONPlaceholder: { userId, id, title, body }
    // Our quote: { id, text, category }
    const apiQuotes = data.map((item) => ({
      id: "api-" + item.id, // Prefix ID to distinguish from local/initial quotes
      text: item.title,
      category: "API Quote", // Assign a generic category as JSONPlaceholder doesn't have one
    }));
    console.log("Fetched quotes from JSONPlaceholder:", apiQuotes);
    return apiQuotes;
  } catch (error) {
    console.error("Error fetching quotes from JSONPlaceholder:", error);
    throw error; // Re-throw to be caught by syncQuotes
  }
}

/**
 * Simulates posting a new quote to the server (JSONPlaceholder).
 * IMPORTANT: JSONPlaceholder does not persist POST requests. This is a simulation
 * of the client *sending* data, but it will not be retrievable in subsequent fetches.
 * @param {Object} quote - The quote object to post.
 * @returns {Promise<Object>} A promise that resolves with the "posted" quote (with server ID).
 */
function simulateServerPost(quote) {
  console.log("Simulating POST of local quote to server:", quote);
  updateSyncStatus("Posting local data...", "pending");
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        // Assign a temporary ID if it doesn't have one for the post body
        const postBody = {
          title: quote.text,
          body: `Category: ${quote.category}`, // Map category to body for JSONPlaceholder
          userId: 1, // Dummy user ID for JSONPlaceholder
        };

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts",
          {
            method: "POST",
            body: JSON.stringify(postBody),
            headers: {
              "Content-type": "application/json; charset=UTF-8", // IMPORTANT: Content-Type header
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const postedData = await response.json();

        // JSONPlaceholder returns the posted data with a new 'id'.
        // Use this ID for our client-side 'postedQuote'.
        const serverAssignedQuote = {
          id: "api-" + postedData.id, // Prefix ID from server
          text: postedData.title, // Use title from response
          category: quote.category, // Use original category as JSONPlaceholder doesn't return it
        };

        console.log(
          "Simulated server acknowledged post for:",
          serverAssignedQuote
        );
        resolve(serverAssignedQuote);
      } catch (error) {
        console.error("Error simulating server post:", error);
        // Even if fetch fails, we might want to still resolve the promise for the sync logic
        // For a real app, you'd handle this more robustly (e.g., retry, mark as failed, etc.)
        resolve({ ...quote, id: quote.id || generateUniqueId() }); // Resolve with client's version if post fails
      }
    }, 1000); // Simulate network delay
  });
}

/**
 * Main function for data synchronization.
 * Fetches server data (from JSONPlaceholder), compares with local, resolves conflicts (server data precedence),
 * and "pushes" local-only new quotes to the server (simulation).
 * RENAMED from syncData to syncQuotes
 */
async function syncQuotes() {
  // RENAMED FUNCTION
  if (isSyncing) {
    console.log("Sync in progress, skipping new sync request.");
    return;
  }
  isSyncing = true;
  updateSyncStatus("Syncing data...", "pending");
  console.log("Initiating data sync...");

  let conflictsResolvedCount = 0;
  let newQuotesFromServerCount = 0;
  let localQuotesPostedCount = 0;

  try {
    const serverQuotes = await fetchQuotesFromServer(); // Fetch from JSONPlaceholder
    const localQuotes = JSON.parse(JSON.stringify(quotes)); // Work with a copy of local quotes

    const mergedQuotesMap = new Map(); // Map to build the final merged set, using ID as key

    // 1. Add all quotes fetched from JSONPlaceholder to the merged map (they take precedence for their IDs)
    serverQuotes.forEach((sQuote) => {
      if (!mergedQuotesMap.has(sQuote.id)) {
        // Only add if not already present (prevents duplicates from same API call)
        mergedQuotesMap.set(sQuote.id, sQuote);
      }
    });

    // 2. Identify and handle local-only quotes or update existing ones (local additions get "posted")
    for (const lQuote of localQuotes) {
      if (!lQuote.id || !mergedQuotesMap.has(lQuote.id)) {
        // If it's a new local quote (no ID) or its ID is not in the mergedMap yet (not from current API fetch)
        // Simulate pushing it to the server
        const postedQuote = await simulateServerPost(lQuote);
        // Even though simulateServerPost does not truly persist on JSONPlaceholder,
        // we add its "acknowledged" version to our local merged set.
        mergedQuotesMap.set(postedQuote.id, postedQuote);
        localQuotesPostedCount++;
      } else {
        // If the local quote's ID exists in mergedQuotesMap (meaning it came from JSONPlaceholder previously)
        // We assume JSONPlaceholder's version takes precedence, so we don't overwrite it here.
        // If local changes were made to an API-originated quote, they are lost.
        // This is the "server's data takes precedence" rule for *those* quotes.
        const serverVersion = mergedQuotesMap.get(lQuote.id);
        if (
          serverVersion &&
          (serverVersion.text !== lQuote.text ||
            serverVersion.category !== lQuote.category)
        ) {
          conflictsResolvedCount++; // Local quote was different, server version won.
        }
      }
    }

    // 3. Count new quotes from API (those not present in local 'quotes' before this sync)
    const currentLocalQuoteIds = new Set(quotes.map((q) => q.id));
    serverQuotes.forEach((sQuote) => {
      if (!currentLocalQuoteIds.has(sQuote.id)) {
        newQuotesFromServerCount++;
      }
    });

    // 4. Convert the map back to an array
    const newQuotesArray = Array.from(mergedQuotesMap.values());

    // Update local state with the merged array
    quotes = newQuotesArray;
    saveQuotes(); // Persist to local storage

    populateCategories(); // Update dropdown with potentially new categories
    showRandomQuote(); // Display a quote from the updated set

    let syncMessage = `Quotes synced with server!`; // Adjusted for test requirement
    if (newQuotesFromServerCount > 0) {
      syncMessage += ` ${newQuotesFromServerCount} new from API.`;
    }
    if (localQuotesPostedCount > 0) {
      syncMessage += ` ${localQuotesPostedCount} local posted.`;
    }
    if (conflictsResolvedCount > 0) {
      syncMessage += ` ${conflictsResolvedCount} conflicts resolved.`;
    }
    if (
      newQuotesFromServerCount === 0 &&
      localQuotesPostedCount === 0 &&
      conflictsResolvedCount === 0
    ) {
      syncMessage = `Data is up-to-date.`;
    }

    updateSyncStatus(syncMessage, "success");
    showMessage(syncMessage, "success");
  } catch (error) {
    console.error("Error during sync:", error);
    updateSyncStatus("Sync failed.", "error");
    showMessage("Error during data sync. Check console for details.", "error");
  } finally {
    isSyncing = false;
  }
}

/**
 * Saves the current 'quotes' array to local storage.
 */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  console.log("Quotes saved to local storage.");
}

/**
 * Loads quotes from local storage.
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
      // Ensure loaded quotes have IDs for sync logic if they were added before IDs were implemented
      quotes = quotes.map((q) => ({ ...q, id: q.id || generateUniqueId() }));
      console.log("Quotes loaded from local storage.");
    } catch (e) {
      console.error("Error parsing stored quotes from local storage:", e);
      quotes = [
        {
          id: "q1",
          text: "The greatest glory in living lies not in never falling, but in rising every time you fall.",
          category: "Life",
        },
        {
          id: "q2",
          text: "Believe you can and you're halfway there.",
          category: "Motivational",
        },
        {
          id: "q3",
          text: "The only way to do great work is to love what you do.",
          category: "Inspirational",
        },
        {
          id: "q4",
          text: "To be or not to be, that is the question.",
          category: "Philosophical",
        },
      ];
      showMessage("Error loading saved quotes. Using default quotes.", "error");
    }
  } else {
    // If no quotes in local storage, ensure initial quotes have IDs
    quotes = quotes.map((q) => ({ ...q, id: q.id || generateUniqueId() }));
  }
}

/**
 * Saves the last viewed quote to session storage.
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
    return quotes;
  } else {
    return quotes.filter((quote) => quote.category === selectedCategory);
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
    noQuoteMessage.textContent = `No quotes found for category: "${selectedCategory}". Please add some!`;
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
  const uniqueCategories = new Set(quotes.map((quote) => quote.category));
  const sortedCategories = Array.from(uniqueCategories).sort();

  categoryFilterDropdown.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilterDropdown.appendChild(allOption);

  sortedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  if (
    !sortedCategories.includes(selectedCategory) &&
    selectedCategory !== "all"
  ) {
    selectedCategory = "all";
    showMessage(
      'Selected category no longer exists, filter reset to "All Categories".',
      "error"
    );
  }
  categoryFilterDropdown.value = selectedCategory;
  saveCategoryFilter();
}

/**
 * Filters quotes based on the selected category from the dropdown.
 * This function is called when the dropdown value changes.
 */
function filterQuotes() {
  selectedCategory = categoryFilterDropdown.value;
  saveCategoryFilter();
  showRandomQuote();
}

/**
 * Saves the current category filter to local storage.
 */
function saveCategoryFilter() {
  localStorage.setItem("selectedCategory", selectedCategory);
  console.log("Category filter saved:", selectedCategory);
}

/**
 * Loads the saved category filter from local storage.
 * @returns {string} The saved filter, or 'all' if none found.
 */
function loadCategoryFilter() {
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    selectedCategory = savedFilter;
    console.log("Category filter loaded:", selectedCategory);
  } else {
    selectedCategory = "all";
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
      // Assign a temporary local ID if not already present
      const newQuote = { id: generateUniqueId(), text, category };
      quotes.push(newQuote);
      saveQuotes(); // Save updated quotes to local storage
      populateCategories(); // Update categories dropdown
      categoryFilterDropdown.value = category; // Set filter to new category
      selectedCategory = category; // Update global filter variable
      saveCategoryFilter(); // Save new category filter to local storage

      showRandomQuote(); // Show a random quote from the (potentially new) filtered set
      showMessage("Quote added successfully!", "success");
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
  showMessage("Quotes exported successfully!", "success");
}

/**
 * Handles importing quotes from a JSON file selected by the user.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    showMessage("No file selected.", "error");
    return;
  }

  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      // Ensure imported quotes have IDs for sync logic
      const validatedQuotes = importedQuotes.map((q) => ({
        ...q,
        id: q.id || generateUniqueId(),
      }));

      if (
        Array.isArray(validatedQuotes) &&
        validatedQuotes.every(
          (q) => typeof q.text === "string" && typeof q.category === "string"
        )
      ) {
        // To avoid duplicate IDs if importing the same file multiple times,
        // we'll merge them carefully. For this simulation, we'll just push.
        // In a real app, you'd check for existing IDs and update/merge.
        quotes.push(...validatedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        showMessage("Quotes imported successfully!", "success");
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

window.onload = async function () {
  loadQuotes(); // 1. Load quotes from local storage
  loadCategoryFilter(); // 2. Load saved category filter
  populateCategories(); // 3. Populate dropdown with categories (from loaded quotes)
  createAddQuoteForm(); // 4. Create and add the new quote form

  // 5. Perform initial sync
  await syncQuotes(); // Await the initial sync to ensure local data is up-to-date with server

  // 6. Try to load and display the last viewed quote from session storage,
  //    but ensure it respects the current filter and updated data.
  const lastQuote = loadLastViewedQuote();
  const filteredQuotes = getFilteredQuotes();

  if (
    lastQuote &&
    filteredQuotes.some(
      (q) => q.text === lastQuote.text && q.category === lastQuote.category
    )
  ) {
    renderQuote(lastQuote);
  } else {
    showRandomQuote();
  }

  // Start periodic sync
  setInterval(syncQuotes, SYNC_INTERVAL);
};

// Add event listener to the "Show New Quote" button
newQuoteBtn.addEventListener("click", showRandomQuote);

// Add event listener for the Export button
exportQuotesBtn.addEventListener("click", exportQuotes);

// Add event listener for the Import file input
importFile.addEventListener("change", importFromJsonFile);

// Add event listener for the Manual Sync button
manualSyncBtn.addEventListener("click", syncQuotes);

// The categoryFilterDropdown has its onchange attribute directly in HTML: onchange="filterQuotes()"
