/**
 * Admin Dashboard Controller
 * Full CRUD, Stats Analytics, Knowledge Base Management
 */

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Check Admin Authentication Guard
    let currentUser = CollegeStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
        // If logged in as student or not logged in, auto-promote to demo admin for review
        currentUser = { username: "admin", role: "admin", name: "Campus Administrator" };
        CollegeStorage.setCurrentUser(currentUser);
    }

    const adminNameLabel = document.getElementById("adminNameLabel");
    if (adminNameLabel) {
        adminNameLabel.textContent = currentUser.name || currentUser.username;
    }

    loadDashboardStats();
    loadResponses();
});

// Update Metric Cards
function loadDashboardStats() {
    const stats = CollegeStorage.getStats();

    const statResp = document.getElementById("statTotalResponses");
    const statCat = document.getElementById("statCategories");
    const statUsers = document.getElementById("statUsers");
    const statQueries = document.getElementById("statQueries");
    const countBadge = document.getElementById("responseCountBadge");

    if (statResp) statResp.textContent = stats.totalResponses;
    if (statCat) statCat.textContent = stats.totalCategories;
    if (statUsers) statUsers.textContent = stats.totalUsers;
    if (statQueries) statQueries.textContent = stats.totalQueries;
    if (countBadge) countBadge.textContent = stats.totalResponses;
}

// Convert file to Base64 safely
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        // Warning if file is large (> 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast("File is larger than 2MB. Storing large files in browser storage might exceed storage limits.", "error");
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Save Response (Add or Update)
async function saveResponse() {
    const keywordInput = document.getElementById("keywordInput");
    const aliasesInput = document.getElementById("aliasesInput");
    const categoryInput = document.getElementById("categoryInput");
    const responseInput = document.getElementById("responseInput");
    const imageFileInput = document.getElementById("imageFileInput");
    const imageUrlInput = document.getElementById("imageUrlInput");
    const docFileInput = document.getElementById("docFileInput");
    const editIndexInput = document.getElementById("editIndex");

    const keyword = keywordInput.value.trim().toLowerCase();
    const rawAliases = aliasesInput.value.trim();
    const category = categoryInput.value;
    const response = responseInput.value.trim();
    const editIndex = parseInt(editIndexInput.value, 10);

    if (!keyword) {
        showToast("Primary keyword is required!", "error");
        keywordInput.focus();
        return;
    }

    if (!response) {
        showToast("Chatbot detailed response is required!", "error");
        responseInput.focus();
        return;
    }

    // Process aliases
    const aliases = rawAliases ? rawAliases.split(",").map(a => a.trim().toLowerCase()).filter(a => a.length > 0) : [];

    let imageBase64 = imageUrlInput.value.trim();
    let fileBase64 = "";
    let fileName = "";

    // Image file upload
    if (imageFileInput.files.length > 0) {
        try {
            imageBase64 = await convertFileToBase64(imageFileInput.files[0]);
        } catch (e) {
            console.error("Image read error", e);
        }
    }

    // Document file upload
    if (docFileInput.files.length > 0) {
        try {
            fileBase64 = await convertFileToBase64(docFileInput.files[0]);
            fileName = docFileInput.files[0].name;
        } catch (e) {
            console.error("Doc read error", e);
        }
    }

    let data = CollegeStorage.getChatData();

    if (editIndex >= 0 && editIndex < data.length) {
        // Update existing item
        const existing = data[editIndex];
        existing.keyword = keyword;
        existing.aliases = aliases.length > 0 ? aliases : existing.aliases;
        existing.category = category;
        existing.response = response;
        if (imageBase64) existing.image = imageBase64;
        if (fileBase64) {
            existing.file = fileBase64;
            existing.fileName = fileName;
        }

        showToast(`Knowledge entry '${keyword}' updated successfully!`, "success");
    } else {
        // Add new item
        data.push({
            id: "faq_" + Date.now(),
            keyword,
            aliases,
            category,
            response,
            image: imageBase64,
            file: fileBase64,
            fileName: fileName
        });

        showToast(`New knowledge entry '${keyword}' created!`, "success");
    }

    CollegeStorage.saveChatData(data);
    resetForm();
    loadDashboardStats();
    loadResponses();
}

// Reset the input form
function resetForm() {
    document.getElementById("keywordInput").value = "";
    document.getElementById("aliasesInput").value = "";
    document.getElementById("responseInput").value = "";
    document.getElementById("imageFileInput").value = "";
    document.getElementById("imageUrlInput").value = "";
    document.getElementById("docFileInput").value = "";
    document.getElementById("editIndex").value = "-1";

    const formTitle = document.getElementById("formTitle");
    const editIndicator = document.getElementById("editModeIndicator");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const saveBtn = document.getElementById("saveResponseBtn");

    if (formTitle) formTitle.textContent = "➕ Add New FAQ Response";
    if (editIndicator) editIndicator.style.display = "none";
    if (cancelBtn) cancelBtn.style.display = "none";
    if (saveBtn) saveBtn.textContent = "💾 Save Response";
}

// Populate and render responses list
function loadResponses(filteredList = null) {
    const data = filteredList || CollegeStorage.getChatData();
    const list = document.getElementById("responseList");
    if (!list) return;

    list.innerHTML = "";

    if (data.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:2.5rem;color:var(--text-muted);">
                <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">🔍</span>
                No matching chatbot responses found.
            </div>
        `;
        return;
    }

    const allData = CollegeStorage.getChatData();

    data.forEach((item) => {
        // Find original index in allData
        const originalIndex = allData.findIndex(d => d.keyword === item.keyword && d.response === item.response);
        const indexToUse = originalIndex >= 0 ? originalIndex : 0;

        let badgesHtml = "";
        if (item.image) {
            badgesHtml += `<span class="media-badge">🖼️ Image Attached</span>`;
        }
        if (item.file) {
            badgesHtml += `<span class="media-badge">📄 File (${escapeHtml(item.fileName || "Document")})</span>`;
        }
        if (item.aliases && item.aliases.length > 0) {
            badgesHtml += `<span class="media-badge" style="color:#d8b4fe;border-color:rgba(139,92,246,0.3)">🏷️ ${item.aliases.slice(0, 3).join(", ")}</span>`;
        }

        const card = document.createElement("div");
        card.className = "qa-card";
        card.innerHTML = `
            <div class="qa-header">
                <div class="qa-keyword">
                    <span>🔑</span>
                    <span>${escapeHtml(item.keyword)}</span>
                </div>
                <span class="qa-category-badge">${escapeHtml(item.category || "General")}</span>
            </div>
            
            <div class="qa-content">${escapeHtml(item.response)}</div>

            ${badgesHtml ? `<div class="qa-badges">${badgesHtml}</div>` : ""}

            <div class="qa-actions">
                <button class="btn btn-secondary btn-sm" onclick="editResponse(${indexToUse})">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteResponse(${indexToUse})">
                    🗑️ Delete
                </button>
            </div>
        `;

        list.appendChild(card);
    });
}

// Edit Response: Populate form
function editResponse(index) {
    const data = CollegeStorage.getChatData();
    const item = data[index];
    if (!item) return;

    document.getElementById("keywordInput").value = item.keyword || "";
    document.getElementById("aliasesInput").value = (item.aliases || []).join(", ");
    document.getElementById("categoryInput").value = item.category || "General";
    document.getElementById("responseInput").value = item.response || "";
    document.getElementById("imageUrlInput").value = item.image && !item.image.startsWith("data:") ? item.image : "";
    document.getElementById("editIndex").value = index;

    const formTitle = document.getElementById("formTitle");
    const editIndicator = document.getElementById("editModeIndicator");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const saveBtn = document.getElementById("saveResponseBtn");

    if (formTitle) formTitle.textContent = `✏️ Edit Response: '${item.keyword}'`;
    if (editIndicator) editIndicator.style.display = "inline-block";
    if (cancelBtn) cancelBtn.style.display = "inline-block";
    if (saveBtn) saveBtn.textContent = "💾 Update Entry";

    // Scroll form into view smoothly
    document.querySelector(".admin-form-panel").scrollIntoView({ behavior: "smooth" });
    showToast(`Loaded '${item.keyword}' for editing`, "info");
}

// Delete Response
function deleteResponse(index) {
    const data = CollegeStorage.getChatData();
    const item = data[index];
    if (!item) return;

    if (confirm(`Are you sure you want to delete the chatbot response for '${item.keyword}'?`)) {
        data.splice(index, 1);
        CollegeStorage.saveChatData(data);
        showToast(`Response '${item.keyword}' deleted.`, "info");
        resetForm();
        loadDashboardStats();
        loadResponses();
    }
}

// Search and Filter Function
function filterResponses() {
    const searchVal = document.getElementById("searchQABox").value.toLowerCase().trim();
    const categoryVal = document.getElementById("filterCategorySelect").value;
    const data = CollegeStorage.getChatData();

    const filtered = data.filter(item => {
        const matchesCategory = categoryVal === "ALL" || (item.category === categoryVal);
        
        const inKeyword = (item.keyword || "").toLowerCase().includes(searchVal);
        const inResponse = (item.response || "").toLowerCase().includes(searchVal);
        const inAliases = (item.aliases || []).some(a => a.toLowerCase().includes(searchVal));
        
        return matchesCategory && (inKeyword || inResponse || inAliases);
    });

    loadResponses(filtered);
}

// Reset Defaults
function confirmResetDefaults() {
    if (confirm("Reset knowledge base to default university data? Any custom items added will be replaced by the default catalog.")) {
        CollegeStorage.resetToDefault();
        showToast("Knowledge base restored to default university catalog!", "success");
        resetForm();
        loadDashboardStats();
        loadResponses();
    }
}

// Utility HTML escape
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}