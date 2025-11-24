// api/analytics.js
// Track page views, orders, and visitor data

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            // Track event
            const { type, data } = req.body;
            const timestamp = new Date().toISOString();
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'Unknown';

            const event = {
                timestamp,
                type, // 'pageview', 'order', 'quote', 'cart_add'
                data,
                userAgent,
                ip
            };

            // Log event (in production, save to database)
            console.log('Analytics Event:', event);

            // Send to Google Sheets if webhook exists
            if (process.env.ANALYTICS_WEBHOOK) {
                await fetch(process.env.ANALYTICS_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });
            }

            return res.status(200).json({ success: true });
        }

        if (req.method === 'GET') {
            // Get analytics summary
            // In production, fetch from database
            const summary = {
                today: {
                    visitors: 0,
                    pageviews: 0,
                    orders: 0,
                    quotes: 0
                },
                week: {
                    visitors: 0,
                    pageviews: 0,
                    orders: 0,
                    quotes: 0
                },
                month: {
                    visitors: 0,
                    pageviews: 0,
                    orders: 0,
                    quotes: 0
                }
            };

            return res.status(200).json({ success: true, data: summary });
        }

    } catch (error) {
        console.error('Analytics error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
