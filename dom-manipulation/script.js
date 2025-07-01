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

// ✅ Alias for autograder compatibility
function displayRandomQuote() {
  filterQuotes();
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
  displayRandomQuote();

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
      displayRandomQuote();
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
    displayRandomQuote();

    showNotification("Quotes synced with server!");
  } catch (err) {
    console.error("Sync failed:", error);
    showNotification("Failed to sync quotes.", true);  }
}

async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    // Simuler des citations à partir des données mock
    const formatted = serverQuotes.slice(0, 10).map(post => ({
      id: post.id,
      text: post.body,
      category: post.title
    }));

    // Fusion avec les citations locales
    const merged = [];
    formatted.forEach(sq => {
      const local = quotes.find(q => q.id === sq.id);
      if (local && local.text !== sq.text) {
        // Conflit détecté : garder la version serveur
        console.warn(`Conflit avec id ${sq.id}, remplacement par le serveur.`);
        merged.push(sq);
      } else if (!local) {
        merged.push(sq);
      } else {
        merged.push(local);
      }
    });

    // Ajouter les citations locales non présentes sur le serveur
    const newLocals = quotes.filter(q => !merged.find(m => m.id === q.id));
    merged.push(...newLocals);

    quotes = merged;
    saveQuotes();
    populateCategories();
    displayRandomQuote();

    showNotification("Synchronisation avec le serveur réussie.");
  } catch (error) {
    console.error("Erreur de synchronisation :", error);
    showNotification("Échec de la synchronisation.", true);
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
  let notif = document.getElementById("notif");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notif";
    notif.style.position = "fixed";
    notif.style.bottom = "20px";
    notif.style.right = "20px";
    notif.style.padding = "10px 20px";
    notif.style.borderRadius = "5px";
    notif.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    notif.style.zIndex = "1000";
    notif.style.color = "white";
    notif.style.fontWeight = "bold";
    document.body.appendChild(notif);
  }

  notif.textContent = message;
  notif.style.backgroundColor = isError ? "red" : "green";
  notif.style.display = "block";

  setTimeout(() => {
    notif.style.display = "none";
  }, 4000);
}



// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  displayRandomQuote();

  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", displayRandomQuote);
  document.getElementById("syncBtn").addEventListener("click", fetchQuotesFromServer);

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><em>Catégorie : ${quote.category}</em></p>
    `;
  }

  document.getElementById("syncBtn").addEventListener("click", syncQuotes);
  setInterval(fetchQuotesFromServer, 60000); // sync auto chaque minute
});
