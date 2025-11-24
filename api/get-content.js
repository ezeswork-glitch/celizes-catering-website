// api/get-content.js
// API to fetch website content and menu

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
        // In production, this would fetch from a database
        // For now, we'll use Vercel Edge Config or KV

        // Default content structure
        const content = {
            businessName: process.env.BUSINESS_NAME || 'Celizes Catering',
            tagline: process.env.TAGLINE || 'Taste of Africa',
            heroTitle: process.env.HERO_TITLE || 'Celizes Catering',
            heroSubtitle: process.env.HERO_SUBTITLE || 'Taste of Africa',
            heroDescription: process.env.HERO_DESCRIPTION || 'Bringing authentic African cuisine to Thunder Bay, Ontario.',
            missionStatement: process.env.MISSION_STATEMENT || 'Bring the authentic taste of African cuisine to the world.',
            phone1: process.env.PHONE_1 || '+1 (249) 885-1296',
            phone2: process.env.PHONE_2 || '+1 (807) 357-9272',
            businessEmail: process.env.BUSINESS_EMAIL || 'celizescatering@gmail.com',
            location: process.env.LOCATION || 'Thunder Bay, Ontario',
            heroImage: process.env.HERO_IMAGE || '',
            logoUrl: process.env.LOGO_URL || ''
        };

        const menuItems = JSON.parse(process.env.MENU_ITEMS || '[]');

        return res.status(200).json({
            success: true,
            content,
            menuItems
        });

    } catch (error) {
        console.error('Error fetching content:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
