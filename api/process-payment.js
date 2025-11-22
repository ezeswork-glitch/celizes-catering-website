// api/process-payment.js
// This is a Vercel serverless function to process Square payments

const { Client, Environment } = require('square');

// Initialize Square client
const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
});

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sourceId, amount, currency } = req.body;

        // Create payment using Square API
        const { result } = await client.paymentsApi.createPayment({
            sourceId: sourceId,
            amountMoney: {
                amount: amount, // Amount in cents
                currency: currency || 'CAD'
            },
            locationId: process.env.SQUARE_LOCATION_ID,
            idempotencyKey: `${Date.now()}-${Math.random()}` // Unique key for each payment
        });

        // Payment successful
        return res.status(200).json({
            success: true,
            paymentId: result.payment.id,
            status: result.payment.status
        });

    } catch (error) {
        console.error('Payment processing error:', error);

        return res.status(400).json({
            success: false,
            error: error.message || 'Payment processing failed'
        });
    }
}
