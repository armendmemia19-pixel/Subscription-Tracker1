
// Get HTML elements
const form = document.getElementById("subscriptionForm");
const subscriptionList = document.getElementById("subscriptionList");

const monthlyTotal = document.getElementById("monthlyTotal");
const yearlyTotal = document.getElementById("yearlyTotal");
const activeCount = document.getElementById("activeCount");

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

// Load subscriptions from localStorage
let subscriptions = JSON.parse(
    localStorage.getItem("subscriptions")
) || [];

// Save subscriptions
function saveSubscriptions() {
    localStorage.setItem(
        "subscriptions",
        JSON.stringify(subscriptions)
    );
}

// Display subscriptions
function displaySubscriptions() {
    subscriptionList.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchValue);
        const matchesCategory =
            filterValue === "All" || sub.category === filterValue;

        return matchesSearch && matchesCategory;
    });

    filteredSubscriptions.forEach(sub => {
        const card = document.createElement("div");
        card.className = "subscription-card";

        const info = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = sub.name;

        const category = document.createElement("p");
        category.textContent = "Category: " + sub.category;

        const price = document.createElement("p");
        price.textContent = `Price: €${sub.price.toFixed(2)} / ${sub.billing}`;

        const date = document.createElement("p");
        date.textContent = "Renewal: " + sub.renewalDate;

        info.append(title, category, price, date);

        const actions = document.createElement("div");
        actions.className = "actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.onclick = () => editSubscription(sub.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = () => deleteSubscription(sub.id);

        actions.append(editButton, deleteButton);

        card.append(info, actions);
        subscriptionList.appendChild(card);
    });

    if (filteredSubscriptions.length === 0) {
        subscriptionList.textContent = "No subscriptions found.";
    }

    updateDashboard();
}

// Add or edit subscription
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;

    const subscription = {
        id: id || crypto.randomUUID(),
        name: document.getElementById("name").value.trim(),
        price: Number(document.getElementById("price").value),
        category: document.getElementById("category").value,
        billing: document.getElementById("billing").value,
        renewalDate: document.getElementById("renewalDate").value
    };

    if (
        !subscription.name ||
        !Number.isFinite(subscription.price) ||
        subscription.price <= 0 ||
        !subscription.category ||
        !subscription.renewalDate
    ) {
        alert("Please enter valid subscription details.");
        return;
    }

    if (id) {
        subscriptions = subscriptions.map(sub =>
            sub.id === id ? subscription : sub
        );
    } else {
        subscriptions.push(subscription);
    }

    saveSubscriptions();
    form.reset();

    document.getElementById("editId").value = "";
    document.getElementById("submitBtn").textContent =
        "Add Subscription";

    displaySubscriptions();
});

// Edit subscription
function editSubscription(id) {
    const sub = subscriptions.find(sub => sub.id === id);

    if (!sub) return;

    document.getElementById("editId").value = sub.id;
    document.getElementById("name").value = sub.name;
    document.getElementById("price").value = sub.price;
    document.getElementById("category").value = sub.category;
    document.getElementById("billing").value = sub.billing;
    document.getElementById("renewalDate").value = sub.renewalDate;

    document.getElementById("submitBtn").textContent =
        "Update Subscription";

    document.querySelector(".form-section").scrollIntoView({
        behavior: "smooth"
    });
}

// Delete subscription
function deleteSubscription(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) return;

    subscriptions = subscriptions.filter(sub => sub.id !== id);

    saveSubscriptions();
    displaySubscriptions();
}

// Update dashboard statistics
function updateDashboard() {
    let monthly = 0;
    let yearly = 0;

    subscriptions.forEach(sub => {
        if (sub.billing === "Monthly") {
            monthly += sub.price;
            yearly += sub.price * 12;
        } else {
            monthly += sub.price / 12;
            yearly += sub.price;
        }
    });

    monthlyTotal.textContent = `€${monthly.toFixed(2)}`;
    yearlyTotal.textContent = `€${yearly.toFixed(2)}`;
    activeCount.textContent = subscriptions.length;
}

// Search subscriptions
searchInput.addEventListener("input", displaySubscriptions);

// Filter subscriptions
filterSelect.addEventListener("change", displaySubscriptions);

// Initial display
displaySubscriptions();
