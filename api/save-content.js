// api/save-content.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify auth token
        const authHeader = req.headers.authorization;
        const token = process.env.ADMIN_TOKEN || 'celizes_admin_2025_token';

        if (!authHeader || !authHeader.includes(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = req.body;

        // Store in Vercel Blob (if available) or environment
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Use Vercel Blob Storage
            const { put } = await import('@vercel/blob');
            await put('website-data.json', JSON.stringify(data), {
                access: 'public',
                addRandomSuffix: false
            });
        }

        // Log for verification
        console.log('[API] Content saved:', {
            menuItems: data.menuItems?.length || 0,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'Content saved successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[API] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
