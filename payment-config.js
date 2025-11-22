// Square Payment Configuration
// Replace these with your actual Square credentials

const SQUARE_CONFIG = {
    applicationId: 'sandbox-sq0idb-KezXQJrfyAI2P6nBboy35Q', // Replace with your Application ID
    locationId: 'LB2MHQXEX74CP', // Replace with your Location ID (found in Square Dashboard)

    // Use 'sandbox' for testing, 'production' for live payments
    environment: 'sandbox' // Change to 'production' when ready to go live
};

// Initialize Square Payments
async function initializeSquarePayments() {
    if (!window.Square) {
        throw new Error('Square.js failed to load properly');
    }

    const payments = window.Square.payments(
        SQUARE_CONFIG.applicationId,
        SQUARE_CONFIG.locationId
    );

    return payments;
}

// Create payment request
async function createPayment(sourceId, amount) {
    const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sourceId: sourceId,
            amount: amount,
            currency: 'CAD'
        }),
    });

    return await response.json();
}
