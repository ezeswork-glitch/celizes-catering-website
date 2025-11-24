// api/get-content.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let data = null;

        // Try to load from Vercel Blob
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                const { head } = await import('@vercel/blob');
                const blob = await head('website-data.json');
                if (blob) {
                    const response = await fetch(blob.url);
                    data = await response.json();
                }
            } catch (e) {
                console.log('[API] No blob data found, using defaults');
            }
        }

        // Return default data if no stored data exists
        if (!data) {
            data = {
                menuItems: [],
                homepageContent: {
                    businessName: 'Celizes Catering',
                    tagline: 'Taste of Africa',
                    heroHeadline: 'Celizes Catering',
                    heroDescription: 'Bringing authentic African cuisine to Thunder Bay, Ontario',
                    phone1: '+1 (249) 885-1296',
                    phone2: '+1 (807) 357-9272',
                    contactEmail: 'celizescatering@gmail.com'
                }
            };
        }

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('[API] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
