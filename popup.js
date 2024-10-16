document.getElementById("addKeyword").addEventListener("click", () => {
    const keyword = document.getElementById("keyword").value.trim();
    if (keyword) {
        chrome.storage.local.get(["keywords"], (result) => {
            const keywords = result.keywords || [];
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                chrome.storage.local.set({ keywords }, () => {
                    document.getElementById("keyword").value = "";
                    displayKeywords();
                    notifyContentScripts();
                });
            } else {
                alert("Ce mot-clé existe déjà.");
            }
        });
    }
});

function displayKeywords() {
    chrome.storage.local.get(["keywords"], (result) => {
        const keywordsList = document.getElementById("keywordsList");
        keywordsList.innerHTML = "";

        (result.keywords || []).forEach(keyword => {
            const li = document.createElement("li");
            li.textContent = keyword;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "X";
            removeBtn.onclick = () => {
                chrome.storage.local.get(["keywords"], (result) => {
                    const keywords = result.keywords || [];
                    const updatedKeywords = keywords.filter(k => k !== keyword);
                    chrome.storage.local.set({ keywords: updatedKeywords }, () => {
                        displayKeywords();
                        notifyContentScripts();
                    });
                });
            };

            li.appendChild(removeBtn);
            keywordsList.appendChild(li);
        });
    });
}

function notifyContentScripts() {
    chrome.tabs.query({ url: ["*://*.hellowork.com/*", "*://*.indeed.com/*", "*://*.jooble.org/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: "updateKeywords" });
        });
    });
}

// Fonction d'exportation des mots-clés
document.getElementById("exportKeywords").addEventListener("click", () => {
    chrome.storage.local.get(["keywords"], (result) => {
        const keywords = result.keywords || [];
        const json = JSON.stringify(keywords, null, 2); // Convertir en JSON

        // Créer un élément <textarea> pour afficher les mots-clés exportés
        const exportArea = document.createElement("textarea");
        exportArea.value = json;
        document.body.appendChild(exportArea);
        exportArea.select();
        document.execCommand("copy"); // Copier le contenu dans le presse-papiers

        // Informer l'utilisateur que l'exportation a réussi
        alert("Mots-clés exportés et copiés dans le presse-papiers !");
        
        // Supprimer l'élément <textarea> après utilisation
        document.body.removeChild(exportArea);
    });
});

// Fonction d'importation des mots-clés
document.getElementById("importKeywordsBtn").addEventListener("click", () => {
    const importText = document.getElementById("importKeywords").value.trim();
    try {
        const importedKeywords = JSON.parse(importText);
        
        if (Array.isArray(importedKeywords)) {
            chrome.storage.local.get(["keywords"], (result) => {
                const keywords = result.keywords || [];
                
                // Ajoute seulement les mots-clés qui ne sont pas déjà présents
                importedKeywords.forEach(keyword => {
                    if (!keywords.includes(keyword)) {
                        keywords.push(keyword);
                    }
                });
                
                chrome.storage.local.set({ keywords }, () => {
                    displayKeywords(); // Met à jour l'affichage après l'importation
                    notifyContentScripts(); // Notifie les scripts de contenu
                });
            });
        } else {
            alert("Le format JSON est invalide. Veuillez entrer un tableau JSON valide.");
        }
    } catch (error) {
        alert("Erreur lors de l'importation : " + error.message);
    }
});

document.addEventListener("DOMContentLoaded", displayKeywords);

document.getElementById("keyword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("addKeyword").click();
    }
});