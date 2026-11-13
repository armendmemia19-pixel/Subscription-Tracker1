
// ========================================
// 1. GET HTML ELEMENTS
// ========================================

const subscriptionForm = document.getElementById("subscriptionForm");

const serviceInput = document.getElementById("service");
const providerInput = document.getElementById("provider");
const subscriberInput = document.getElementById("subscriber");
const renewalDateInput = document.getElementById("renewalDate");
const categoryInput = document.getElementById("category");

const submitBtn = document.getElementById("submitBtn");

const tableBody = document.getElementById("subscriptionTableBody");

const totalSubscriptionsElement =
    document.getElementById("totalSubscriptions");

const expiredSubscriptionsElement =
    document.getElementById("expiredSubscriptions");


// ========================================
// 2. LOAD DATA FROM LOCAL STORAGE
// ========================================

let subscriptions = [];

try {
    const savedSubscriptions = localStorage.getItem("subscriptions");

    if (savedSubscriptions) {
        const parsedData = JSON.parse(savedSubscriptions);

        subscriptions = Array.isArray(parsedData)
            ? parsedData
            : [];
    }
} catch (error) {
    console.error("Error loading subscriptions:", error);
}


// ID of the subscription currently being edited
let editingId = null;


// ========================================
// 3. SAVE DATA TO LOCAL STORAGE
// ========================================

function saveSubscriptions() {

    try {
        localStorage.setItem(
            "subscriptions",
            JSON.stringify(subscriptions)
        );

    } catch (error) {
        console.error("Error saving subscriptions:", error);
        alert("Could not save subscriptions to localStorage.");
    }

}


// ========================================
// 4. GET CURRENT DATE
// ========================================

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ========================================
// 5. CALCULATE SUBSCRIPTION STATUS
// ========================================

function getSubscriptionStatus(renewalDate) {

    const today = getTodayDate();

    if (renewalDate < today) {
        return "Expired";
    }

    return "Active";

}


// ========================================
// 6. DISPLAY SUBSCRIPTIONS
// ========================================

function displaySubscriptions() {

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Check if there are no subscriptions
    if (subscriptions.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.className = "empty-message";
        cell.textContent = "No subscriptions found.";

        row.appendChild(cell);

        tableBody.appendChild(row);

    } else {

        // Loop through all subscriptions
        subscriptions.forEach(subscription => {

            const row = document.createElement("tr");

            // Service
            const serviceCell = document.createElement("td");
            serviceCell.textContent = subscription.service;

            // Provider
            const providerCell = document.createElement("td");
            providerCell.textContent = subscription.provider;

            // Subscriber
            const subscriberCell = document.createElement("td");
            subscriberCell.textContent = subscription.subscriber;

            // Renewal Date
            const renewalDateCell = document.createElement("td");
            renewalDateCell.textContent = subscription.renewalDate;

            // Category
            const categoryCell = document.createElement("td");
            categoryCell.textContent = subscription.category;

            // Status
            const statusCell = document.createElement("td");

            const status = getSubscriptionStatus(
                subscription.renewalDate
            );

            const statusBadge = document.createElement("span");

            statusBadge.classList.add("status");

            statusBadge.classList.add(
                status.toLowerCase()
            );

            statusBadge.textContent = status;

            statusCell.appendChild(statusBadge);

            // Action buttons
            const actionCell = document.createElement("td");

            const actionButtons = document.createElement("div");

            actionButtons.className = "action-buttons";

            // Edit button
            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";

            editButton.addEventListener("click", function() {
                editSubscription(subscription.id);
            });

            // Delete button
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", function() {
                deleteSubscription(subscription.id);
            });

            // Add buttons to action column
            actionButtons.append(editButton, deleteButton);

            actionCell.appendChild(actionButtons);

            // Add all cells to the row
            row.append(
                serviceCell,
                providerCell,
                subscriberCell,
                renewalDateCell,
                categoryCell,
                statusCell,
                actionCell
            );

            // Add row to the table
            tableBody.appendChild(row);

        });

    }

    // Update summary
    updateSummary();

}


// ========================================
// 7. ADD OR UPDATE SUBSCRIPTION
// ========================================

subscriptionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get values from form
    const service = serviceInput.value.trim();

    const provider = providerInput.value.trim();

    const subscriber = subscriberInput.value.trim();

    const renewalDate = renewalDateInput.value;

    const category = categoryInput.value;

    // Validate required fields
    if (
        !service ||
        !provider ||
        !subscriber ||
        !renewalDate ||
        !category
    ) {

        alert("Please complete all required fields.");

        return;
    }

    // Create subscription object
    const subscription = {

        id: editingId || (
            crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`
        ),

        service: service,

        provider: provider,

        subscriber: subscriber,

        renewalDate: renewalDate,

        category: category

    };


    if (editingId !== null) {

        // Update existing subscription
        subscriptions = subscriptions.map(item => {

            if (item.id === editingId) {
                return subscription;
            }

            return item;

        });

    } else {

        // Add new subscription
        subscriptions.push(subscription);

    }


    // Save changes
    saveSubscriptions();

    // Reset form
    resetForm();

    // Refresh table
    displaySubscriptions();

});


// ========================================
// 8. EDIT SUBSCRIPTION
// ========================================

function editSubscription(id) {

    // Find subscription by ID
    const subscription = subscriptions.find(item => {
        return item.id === id;
    });

    if (!subscription) {
        return;
    }

    // Store editing ID
    editingId = id;

    // Fill form with existing data
    serviceInput.value = subscription.service;

    providerInput.value = subscription.provider;

    subscriberInput.value = subscription.subscriber;

    renewalDateInput.value = subscription.renewalDate;

    categoryInput.value = subscription.category;

    // Change button text
    submitBtn.textContent = "Update Subscription";

    // Scroll to form
    subscriptionForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ========================================
// 9. DELETE SUBSCRIPTION
// ========================================

function deleteSubscription(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) {
        return;
    }

    // Remove subscription from array
    subscriptions = subscriptions.filter(item => {
        return item.id !== id;
    });

    // If deleting the subscription being edited,
    // reset the form
    if (editingId === id) {
        resetForm();
    }

    // Save updated data
    saveSubscriptions();

    // Refresh table
    displaySubscriptions();

}


// ========================================
// 10. RESET FORM
// ========================================

function resetForm() {

    subscriptionForm.reset();

    editingId = null;

    submitBtn.textContent = "Add Subscription";

}


// ========================================
// 11. UPDATE SUMMARY
// ========================================

function updateSummary() {

    // Total subscriptions
    const total = subscriptions.length;

    // Count expired subscriptions
    const expired = subscriptions.filter(subscription => {

        return getSubscriptionStatus(
            subscription.renewalDate
        ) === "Expired";

    }).length;

    // Update HTML elements
    totalSubscriptionsElement.textContent = total;

    expiredSubscriptionsElement.textContent = expired;

}


// ========================================
// 12. INITIALIZE APPLICATION
// ========================================

// Display saved subscriptions when page loads
displaySubscriptions();
