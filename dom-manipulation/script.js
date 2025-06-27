const display = document.getElementById("quoteDisplay");
const btn = document.getElementById("newQuote");
const quoteInput = document.getElementById("newQuoteText");
const categoryInput = document.getElementById("newQuoteCategory");

const quotes = [
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time you fall.",
        category: "Life"
    },
    {
        text: "Believe you can and you're halfway there.",
        category: "inspirational"
    },
    {
        text: "The only way to do great work is to love what you do.",
        category: "inspirational"
    }

]

function newQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    display.textContent = randomQuote.text;
    categoryInput.value = randomQuote.category;
    quoteInput.value = "";
    quoteInput.focus();
    }

btn.addEventListener('click', showRandomQuote);

