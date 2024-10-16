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

document.addEventListener("DOMContentLoaded", displayKeywords);

document.getElementById("keyword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("addKeyword").click();
    }
});