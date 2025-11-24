// api/send-quote.js
// Enhanced with customer auto-reply and Google Sheets logging

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

        // 1. Send notification to business
        const businessEmailSubject = `New Quote Request from ${name}`;
        const businessEmailBody = `
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
Reply to: ${email}
Call: ${phone}
        `;

        // 2. Send auto-reply to customer
        const customerEmailSubject = 'Thank You for Your Quote Request - Celizes Catering';
        const customerEmailBody = `
Hello ${name},

Thank you for your interest in Celizes Catering!

We have received your quote request for your ${eventType} event with ${guests} guests${eventDate ? ' on ' + eventDate : ''}.

Our team will review your request and get back to you within 24 hours with a custom quote tailored to your needs.

In the meantime, if you have any questions, feel free to contact us:
📞 +1 (249) 885-1296
📞 +1 (807) 357-9272
📧 celizescatering@gmail.com

We look forward to making your event special with authentic African cuisine!

Best regards,
Celizes Catering Team
Taste of Africa

---
Your Request Details:
Event Type: ${eventType}
Number of Guests: ${guests}
Event Date: ${eventDate || 'To be determined'}
Special Requests: ${details || 'None'}
        `;

        if (!process.env.RESEND_API_KEY) {
            return res.status(500).json({ success: false, error: 'Email service not configured' });
        }

        // Send business notification
        const businessResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Celizes Catering Website <onboarding@resend.dev>',
                to: ['celizescatering@gmail.com'],
                subject: businessEmailSubject,
                text: businessEmailBody,
                reply_to: email
            })
        });

        // Send customer auto-reply
        const customerResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Celizes Catering <onboarding@resend.dev>',
                to: [email],
                subject: customerEmailSubject,
                text: customerEmailBody
            })
        });

        // 3. Save to Google Sheets (if configured)
        if (process.env.GOOGLE_SHEETS_WEBHOOK) {
            const timestamp = new Date().toISOString();
            await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp,
                    name,
                    email,
                    phone,
                    eventType,
                    guests,
                    eventDate: eventDate || 'Not specified',
                    details: details || 'None'
                })
            });
        }

        const businessResult = await businessResponse.json();
        const customerResult = await customerResponse.json();

        if (businessResponse.ok) {
            console.log('✅ Business notification sent');
            console.log('✅ Customer auto-reply sent');
            return res.status(200).json({ 
                success: true, 
                message: 'Quote request sent successfully'
            });
        } else {
            console.error('Email error:', businessResult);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to send emails'
            });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
