let quotes = [];

// Charger les citations et le filtre sélectionné
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "La vie est belle.", category: "Vie" },
    { text: "L’échec est la clé du succès.", category: "Motivation" },
    { text: "Soyez vous-même; tous les autres sont déjà pris.", category: "Inspiration" }
  ];
  saveQuotes(); // Sauvegarde initiale si besoin

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    document.getElementById("categoryFilter").value = lastFilter;
  }
}

// Sauvegarder les citations
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Afficher une citation en fonction du filtre
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>Aucune citation trouvée.</p>";
    return;
  }

  const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Catégorie : ${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Ajouter une nouvelle citation
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Veuillez remplir les deux champs.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories(); // met à jour le dropdown
  filterQuotes(); // affiche la nouvelle citation

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Citation ajoutée !");
}

// Remplir dynamiquement la liste des catégories
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));

  dropdown.innerHTML = '<option value="All">Toutes les catégories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter && dropdown.querySelector(`option[value="${lastFilter}"]`)) {
    dropdown.value = lastFilter;
  }
}

// Exporter les citations en JSON
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

// Importer des citations via un fichier JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  const file = event.target.files[0];
  if (!file) return;

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Format invalide");

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Citations importées avec succès !");
    } catch (error) {
      alert("Erreur : fichier JSON invalide.");
    }
  };

  fileReader.readAsText(file);
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuote").addEventListener("click", filterQuotes);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

  // Affichage de la dernière citation (sessionStorage)
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><em>Catégorie : ${quote.category}</em></p>
    `;
  }
});
