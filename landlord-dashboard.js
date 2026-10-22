document.addEventListener("DOMContentLoaded", function () {
    const $ = (id) => document.getElementById(id);

    // Save demo data in this browser
    function readData(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            alert("Data could not be saved in this browser.");
        }
    }

    let properties = readData("landlordProperties", []);
    let expenses = readData("landlordExpenses", []);
    let profile = readData("landlordProfile", {
        name: "Landlord",
        email: ""
    });

    const money = (amount) =>
        "₹" + Number(amount || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    // Current date
    $("currentDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    // Update dashboard information
    function updateDashboard() {
        const monthlyRent = properties.reduce(
            (total, property) => total + Number(property.rent || 0), 0
        );

        const tenants = [
            ...new Set(
                properties
                    .map(property => property.tenant.trim())
                    .filter(Boolean)
            )
        ];

        $("propertyCount").textContent = properties.length;
        $("tenantCount").textContent = tenants.length;
        $("monthlyRent").textContent = money(monthlyRent);
        $("requestCount").textContent = "0";

        $("overviewMonthly").textContent = money(monthlyRent);
        $("overviewYearly").textContent = money(monthlyRent * 12);
        $("overviewProperties").textContent = properties.length;

        $("requestBadge").textContent = "0 Pending";

        renderProperties();
        renderTenants();
        renderExpenses();
    }

    // Display properties
    function renderProperties() {
        const list = $("propertyList");

        if (properties.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span>🏠</span>
                    <h3>No properties added</h3>
                    <p>Click Add Property to add your first property.</p>
                </div>`;
            return;
        }

        list.innerHTML = properties.map(property => `
            <div class="property-item">
                <div class="item-main">
                    <h3>${escapeHTML(property.name)}</h3>
                    <p>${escapeHTML(property.type)} ·
                       ${escapeHTML(property.location)}</p>
                    <p>${property.tenant
                        ? "Tenant: " + escapeHTML(property.tenant)
                        : "No tenant assigned"}</p>
                    <div class="item-price">${money(property.rent)} / month</div>
                </div>
                <button class="delete-btn"
                    data-delete-property="${property.id}">
                    Delete
                </button>
            </div>
        `).join("");
    }

    // Display tenants based on property records
    function renderTenants() {
        const list = $("tenantList");

        const occupiedProperties = properties.filter(
            property => property.tenant.trim() !== ""
        );

        if (occupiedProperties.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span>👥</span>
                    <h3>No tenants listed</h3>
                    <p>Add a tenant name when creating a property.</p>
                </div>`;
            return;
        }

        list.innerHTML = occupiedProperties.map(property => `
            <div class="tenant-item">
                <div class="item-main">
                    <h3>${escapeHTML(property.tenant)}</h3>
                    <p>${escapeHTML(property.name)}</p>
                    <p>${escapeHTML(property.location)}</p>
                </div>
                <div class="item-price">${money(property.rent)}</div>
            </div>
        `).join("");
    }

    // Display expenses
    function renderExpenses() {
        const list = $("expenseList");

        if (expenses.length === 0) {
            list.innerHTML =
                '<p class="note">No expenses recorded yet.</p>';
            return;
        }

        list.innerHTML = expenses.map(expense => `
            <div class="expense-item">
                <div class="item-main">
                    <h3>${escapeHTML(expense.title)}</h3>
                    <p>Property expense</p>
                </div>
                <strong class="item-price">${money(expense.amount)}</strong>
                <button class="delete-btn"
                    data-delete-expense="${expense.id}">
                    Delete
                </button>
            </div>
        `).join("");
    }

    // Protect text entered by users before displaying it in HTML
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    // Open Add Property popup
    $("addPropertyBtn").addEventListener("click", function () {
        $("propertyModal").hidden = false;
        $("propertyName").focus();
    });

    // Close popup
    $("closeModal").addEventListener("click", function () {
        $("propertyModal").hidden = true;
    });

    // Close popup when clicking outside the form
    $("propertyModal").addEventListener("click", function (event) {
        if (event.target === $("propertyModal")) {
            $("propertyModal").hidden = true;
        }
    });

    // Add a new property
    $("propertyForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const name = $("propertyName").value.trim();
        const location = $("propertyLocation").value.trim();
        const type = $("propertyType").value;
        const rent = Number($("propertyRent").value);
        const tenant = $("propertyTenant").value.trim();

        if (!name || !location || !type || !Number.isFinite(rent) ||
            rent <= 0) {
            alert("Please enter valid property details and rent.");
            return;
        }

        properties.push({
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            name,
            location,
            type,
            rent,
            tenant
        });

        saveData("landlordProperties", properties);
        updateDashboard();

        $("propertyForm").reset();
        $("propertyModal").hidden = true;

        alert("Property added successfully!");
    });

    // Delete a property
    $("propertyList").addEventListener("click", function (event) {
        const button = event.target.closest("[data-delete-property]");
        if (!button) return;

        const id = button.dataset.deleteProperty;

        if (!confirm("Do you want to delete this property?")) return;

        properties = properties.filter(property => property.id !== id);
        saveData("landlordProperties", properties);
        updateDashboard();
    });

    // Add an expense
    $("expenseForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const title = $("expenseTitle").value.trim();
        const amount = Number($("expenseAmount").value);

        if (!title || !Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid expense and amount.");
            return;
        }

        expenses.push({
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            title,
            amount
        });

        saveData("landlordExpenses", expenses);
        $("expenseForm").reset();
        renderExpenses();

        alert("Expense recorded successfully!");
    });

    // Delete an expense
    $("expenseList").addEventListener("click", function (event) {
        const button = event.target.closest("[data-delete-expense]");
        if (!button) return;

        const id = button.dataset.deleteExpense;

        expenses = expenses.filter(expense => expense.id !== id);
        saveData("landlordExpenses", expenses);
        renderExpenses();
    });

    // Load saved profile
    $("landlordName").value = profile.name || "Landlord";
    $("landlordEmail").value = profile.email || "";
    updateProfileDisplay();

    function updateProfileDisplay() {
        const name = profile.name || "Landlord";
        $("navName").textContent = name;
        $("welcomeName").textContent = name;

        document.querySelector(".avatar").textContent =
            name.trim().charAt(0).toUpperCase() || "L";

        document.querySelector(".profile-avatar").textContent =
            name.trim().charAt(0).toUpperCase() || "L";
    }

    // Save profile
    $("profileForm").addEventListener("submit", function (event) {
        event.preventDefault();

        profile = {
            name: $("landlordName").value.trim() || "Landlord",
            email: $("landlordEmail").value.trim()
        };

        saveData("landlordProfile", profile);
        updateProfileDisplay();

        $("profileMessage").textContent = "Profile saved successfully!";
    });

    // View all properties
    $("viewPropertiesBtn").addEventListener("click", function () {
        $("properties").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Initial render
    updateDashboard();
});