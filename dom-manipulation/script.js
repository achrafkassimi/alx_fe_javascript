let quotes = [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
  { text: "Creativity is intelligence having fun.", category: "Inspiration" }
];

// Display a random quote
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "All") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  const display = document.getElementById("quoteDisplay");
  display.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;
}

// Add new quote from user input
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  updateCategoryDropdown();
  alert("Quote added!");
}

// Populate category dropdown with unique values
function updateCategoryDropdown() {
  const select = document.getElementById("categoryFilter");
  const existing = Array.from(select.options).map(opt => opt.value);

  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  select.innerHTML = '<option value="All">All</option>'; // Reset

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  updateCategoryDropdown();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", showRandomQuote);
});
