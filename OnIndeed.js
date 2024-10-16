const keywords = [
    "Digital College",
    "STUDI CFA",
    "3W Academy",
    "IEF2I Education",
    "2i Academy",
    "ISCOD",
    "L'École Française",
    "Collège de Paris Développement"
];

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function hideAdsByKeywords() {
    console.log("Début du filtrage des annonces sur Indeed...");

    chrome.storage.local.get(["keywords"], (result) => {
        const userKeywords = result.keywords || [];
        const allKeywords = keywords.concat(userKeywords);

        const relevantElements = document.querySelectorAll('li');
        console.log(`Total d'éléments pertinents sur la page : ${relevantElements.length}`);

        const keywordCount = {};

        for (let element of relevantElements) {
            const elementText = Array.from(element.querySelectorAll('span')).map(span => span.textContent).join(' ');
            const normalizedElementText = normalizeString(elementText);

            const foundKeyword = allKeywords.some(keyword => 
                normalizedElementText.includes(normalizeString(keyword))
            );

            if (foundKeyword) {
                element.style.display = "none";

                allKeywords.forEach(keyword => {
                    if (normalizedElementText.includes(normalizeString(keyword))) {
                        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
                    }
                });
            }
        }

        Object.entries(keywordCount).forEach(([keyword, count]) => {
            if (count > 0) {
                console.log(`Suppression de ${count} posts pour le mot-clé : ${keyword}`);
            }
        });
    });
}

window.addEventListener("load", hideAdsByKeywords);

const observer = new MutationObserver(hideAdsByKeywords);

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "updateKeywords") {
        console.log("Message de mise à jour des mots-clés reçu sur Indeed.");
        hideAdsByKeywords();
    }
});