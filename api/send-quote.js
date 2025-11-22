// api/send-quote.js
// Vercel Serverless Function to send quote request emails

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, eventType, guests, eventDate, details } = req.body;

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
Reply to this customer at: ${email} or ${phone}
        `;

        // Send email using Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${process.env.RESEND_API_KEY}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Celizes Catering <quotes@celizescatering.com>',
                to: ['celizescatering@email.com'],
                subject: emailSubject,
                text: emailBody,
                reply_to: email
            })
        });

        if (response.ok) {
            return res.status(200).json({ 
                success: true, 
                message: 'Quote request sent successfully' 
            });
        } else {
            const error = await response.json();
            console.error('Resend API error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to send email' 
            });
        }

    } catch (error) {
        console.error('Error sending quote:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
}
