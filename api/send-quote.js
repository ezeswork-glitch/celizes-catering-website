// api/send-quote.js
// Vercel Serverless Function for Email Notifications

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { name, email, phone, eventType, guests, eventDate, details } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !eventType || !guests) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        // Create email content
        const emailSubject = `New Quote Request from ${name}`;
        const emailBody = `
NEW QUOTE REQUEST - Celizes Catering

Customer Information:
====================
Name: ${name}
Email: ${email}
Phone: ${phone}

Event Details:
==============
Event Type: ${eventType}
Number of Guests: ${guests}
Event Date: ${eventDate || 'Not specified'}

Additional Details:
==================
${details || 'No additional details provided'}

---
This quote request was submitted from your website.
Reply to this customer at: ${email} or call: ${phone}
        `;

        // Check if Resend API key exists
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY not found in environment variables');
            return res.status(500).json({ 
                success: false, 
                error: 'Email service not configured' 
            });
        }

        // Send email using Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Celizes Catering Website <onboarding@resend.dev>',
                to: ['celizescatering@email.com'],
                subject: emailSubject,
                text: emailBody,
                reply_to: email
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Email sent successfully:', result);
            return res.status(200).json({ 
                success: true, 
                message: 'Quote request sent successfully',
                emailId: result.id
            });
        } else {
            console.error('Resend API error:', result);
            return res.status(500).json({ 
                success: false, 
                error: result.message || 'Failed to send email'
            });
        }

    } catch (error) {
        console.error('Error in send-quote function:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error: ' + error.message
        });
    }
}
