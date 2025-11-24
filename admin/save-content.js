// api/save-content.js
// API to save website content (requires authentication)

export default async function handler(req, res) {
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
        // Verify admin token
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { content, menuItems } = req.body;

        // In production, save to database
        // For now, log the changes (you'll need to update env vars manually)
        console.log('Content update requested:', { content, menuItems });

        // Save to a simple JSON store (you can use Vercel KV or other storage)
        // For now, we'll return success and you can manually update env vars

        return res.status(200).json({
            success: true,
            message: 'Content saved. To make live, update Vercel environment variables.',
            data: { content, menuItems }
        });

    } catch (error) {
        console.error('Error saving content:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
