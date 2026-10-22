const form = document.getElementById("rentForm");

let calculations = [];
let latestCalculation = null;

const money = amount =>
    "₹" + Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

function getValue(id) {
    return Number(document.getElementById(id).value);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const rent = getValue("rent");
    const maintenance = getValue("maintenance");
    const parking = getValue("parking");
    const utilities = getValue("utilities");
    const internet = getValue("internet");
    const other = getValue("other");
    const deposit = getValue("deposit");
    const brokerage = getValue("brokerage");
    const income = getValue("income");

    const location = document.getElementById("location")
        .value.trim();

    const monthly = rent + maintenance + parking +
        utilities + internet + other;

    const yearly = monthly * 12;
    const initial = monthly + deposit + brokerage;
    const percentage = income > 0
        ? (monthly / income) * 100
        : null;

    latestCalculation = {
        date: new Date().toLocaleDateString("en-IN"),
        location,
        monthly,
        yearly,
        initial,
        percentage
    };

    document.getElementById("result").classList.remove("hidden");

    document.getElementById("monthlyResult").textContent =
        money(monthly);

    document.getElementById("yearlyResult").textContent =
        money(yearly);

    document.getElementById("initialResult").textContent =
        money(initial);

    document.getElementById("percentageResult").textContent =
        percentage === null
            ? "Income not entered"
            : percentage.toFixed(1) + "%";

    document.getElementById("monthlyStat").textContent =
        money(monthly);

    document.getElementById("yearlyStat").textContent =
        money(yearly);

    document.getElementById("initialStat").textContent =
        money(initial);

    document.getElementById("analysisMonthly").textContent =
        money(monthly);

    document.getElementById("analysisYearly").textContent =
        money(yearly);

    document.getElementById("analysisPercent").textContent =
        percentage === null
            ? "N/A"
            : percentage.toFixed(1) + "%";

    const progress = percentage === null
        ? 0
        : Math.min(percentage, 100);

    document.getElementById("progressBar").style.width =
        progress + "%";

    let advice;

    if (percentage === null) {
        advice = "Enter your monthly income for affordability analysis.";
    } else if (percentage <= 30) {
        advice = "Your rental cost is within the recommended 30% budget guideline.";
    } else if (percentage <= 40) {
        advice = "Your rent may be manageable, but review your other expenses.";
    } else {
        advice = "Your rent takes a large share of your income. Consider a lower-cost option.";
    }

    document.getElementById("advice").textContent = advice;
    document.getElementById("analysisAdvice").textContent = advice;

    calculations.unshift(latestCalculation);

    document.getElementById("countStat").textContent =
        calculations.length;

    renderHistory();

    document.getElementById("result").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
});

function renderHistory() {
    const tbody = document.getElementById("historyBody");
    tbody.innerHTML = "";

    if (calculations.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="4">No calculations yet.</td></tr>';
        return;
    }

    calculations.forEach(item => {
        const row = document.createElement("tr");

        [
            item.date,
            item.location,
            money(item.monthly),
            money(item.yearly)
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

document.getElementById("clearHistory")
    .addEventListener("click", function () {
        if (confirm("Are you sure you want to clear the history?")) {
            calculations = [];
            latestCalculation = null;

            document.getElementById("countStat").textContent = "0";
            renderHistory();
        }
    });

document.getElementById("editProfile")
    .addEventListener("click", function () {
        const name = prompt("Enter your name:");

        if (name && name.trim()) {
            document.getElementById("profileName").textContent =
                name.trim();
        }
    });