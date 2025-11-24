// api/send-quote.js
// Email notification to celizescatering@gmail.com

export default async function handler(req, res) {
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

        if (!name || !email || !phone || !eventType || !guests) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

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
Reply to this customer at: ${email}
Or call them at: ${phone}
        `;

        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY not found');
            return res.status(500).json({ success: false, error: 'Email service not configured' });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Celizes Catering Website <onboarding@resend.dev>',
                to: ['celizescatering@gmail.com'],
                subject: emailSubject,
                text: emailBody,
                reply_to: email
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Email sent successfully to celizescatering@gmail.com');
            console.log('Quote from:', name, email, phone);
            return res.status(200).json({ 
                success: true, 
                message: 'Quote request sent successfully'
            });
        } else {
            console.error('❌ Resend API error:', result);
            // Still log the quote data even if email fails
            console.log('Quote Request (email failed):', { name, email, phone, eventType, guests, eventDate, details });
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to send email',
                details: result.message || 'Unknown error'
            });
        }

    } catch (error) {
        console.error('❌ Error in send-quote:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
