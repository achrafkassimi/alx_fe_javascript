let quotes = [];

// Charger les citations depuis le stockage local ou utiliser par défaut
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "La vie, c’est ce qui arrive quand on a prévu autre chose.", category: "Vie" },
      { text: "Le succès n’est pas ce que vous avez, mais qui vous êtes.", category: "Succès" },
      { text: "La créativité, c’est l’intelligence qui s’amuse.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

// Sauvegarder les citations dans localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Afficher une citation aléatoire selon la catégorie sélectionnée
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  let filtered = category === "All" ? quotes : quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = `<p>Aucune citation disponible.</p>`;
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];

  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${randomQuote.text}"</blockquote>
    <p><em>Catégorie : ${randomQuote.category}</em></p>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Ajouter une nouvelle citation
function createAddQuoteForm() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Veuillez remplir la citation et la catégorie.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  updateCategoryDropdown();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Citation ajoutée avec succès !");
}

// Mettre à jour la liste déroulante des catégories
function updateCategoryDropdown() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));

  dropdown.innerHTML = '<option value="All">Toutes</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });
}

// Exporter les citations en fichier JSON
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Importer les citations depuis un fichier JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Format invalide");

      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryDropdown();
      alert("Citations importées avec succès !");
    } catch (err) {
      alert("Erreur lors de l'import. Fichier invalide.");
    }
  };

  const file = event.target.files[0];
  if (file) fileReader.readAsText(file);
}

// Initialiser les événements à DOM prêt
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  updateCategoryDropdown();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", createAddQuoteForm);
  document.getElementById("categoryFilter").addEventListener("change", showRandomQuote);

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><em>Catégorie : ${quote.category}</em></p>
    `;
  }
});
