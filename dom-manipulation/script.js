let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Charger les citations et le filtre sélectionné
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { id: 1, text: "La vie est belle.", category: "Vie" },
    { id: 2, text: "L’échec est la clé du succès.", category: "Motivation" },
    { id: 3, text: "Soyez vous-même; les autres sont déjà pris.", category: "Inspiration" }
  ];
  saveQuotes();
}

// Sauvegarder les citations dans localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Remplir dynamiquement le menu des catégories
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));

  dropdown.innerHTML = '<option value="All">Toutes les catégories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) dropdown.value = lastFilter;
}

// Afficher une citation aléatoire filtrée par catégorie
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filtered = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>Aucune citation trouvée.</p>";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];

  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Catégorie : ${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Ajouter une nouvelle citation et l'envoyer au serveur
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Veuillez remplir les deux champs.");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Citation ajoutée !");

  // ✅ Envoyer la citation au serveur simulé
  fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newQuote)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Citation postée au serveur :", data);
  })
  .catch(error => {
    console.error("Erreur lors de l'envoi au serveur :", error);
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

// Importer des citations depuis un fichier JSON
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Format invalide");

      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Import réussi !");
    } catch (err) {
      alert("Fichier JSON invalide.");
    }
  };
  reader.readAsText(file);
}

// Synchroniser avec le serveur simulé (GET)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    const formatted = serverQuotes.map(q => ({
      id: q.id,
      text: q.body,
      category: q.title
    }));

    const merged = [];
    formatted.forEach(sq => {
      const local = quotes.find(q => q.id === sq.id);
      if (local && local.text !== sq.text) {
        promptConflict(local, sq);
      } else {
        merged.push(sq);
      }
    });

    quotes.filter(q => !q.id || !merged.find(m => m.id === q.id))
      .forEach(q => merged.push(q));

    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuotes();

    showNotification("Synchronisation terminée.");
  } catch (err) {
    showNotification("Erreur de synchronisation.", true);
  }
}

// Résolution simple des conflits
function promptConflict(local, server) {
  const keepServer = confirm(
    `Conflit :\n\nLocal : "${local.text}"\nServeur : "${server.text}"\n\nRemplacer par la version serveur ?`
  );
  if (keepServer) {
    const index = quotes.findIndex(q => q.id === local.id);
    quotes[index] = server;
  }
}

// Affichage des notifications
function showNotification(message, isError = false) {
  const notif = document.getElementById("notif");
  notif.textContent = message;
  notif.style.color = isError ? "red" : "green";
  notif.style.display = "block";
  setTimeout(() => notif.style.display = "none", 5000);
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuote").addEventListener("click", filterQuotes);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("syncBtn").addEventListener("click", fetchQuotesFromServer);

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><em>Catégorie : ${quote.category}</em></p>
    `;
  }

  setInterval(fetchQuotesFromServer, 60000); // sync auto chaque minute
});
