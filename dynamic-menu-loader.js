<!-- This section loads menu dynamically -->
<script>
// Load menu items from API when page loads
async function loadMenuItems() {
    try {
        const response = await fetch('/api/get-content');
        const result = await response.json();

        if (result.success && result.data.menuItems) {
            renderMenuItems(result.data.menuItems);
        }
    } catch (error) {
        console.log('Using default menu items');
        // Fallback to default items if API fails
    }
}

function renderMenuItems(items) {
    // Group by category
    const categories = {
        'Main Dishes': [],
        'Soups & Stews': [],
        'Baked Goods & Cakes': [],
        'Snacks & Drinks': []
    };

    items.forEach(item => {
        if (categories[item.category]) {
            categories[item.category].push(item);
        }
    });

    // Render each category
    const menuContainer = document.getElementById('menu-items-container');
    if (!menuContainer) return;

    menuContainer.innerHTML = '';

    for (const [category, items] of Object.entries(categories)) {
        if (items.length === 0) continue;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        categoryDiv.innerHTML = `
            <h3>${category}</h3>
            <div class="menu-grid">
                ${items.map(item => `
                    <div class="menu-item">
                        <div class="menu-item-image">
                            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '🍽️'}
                        </div>
                        <h4>${item.name}</h4>
                        <p class="price">${item.price}</p>
                        ${item.description ? `<p class="description">${item.description}</p>` : ''}
                        <button onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\'")}', '${item.price}')">
                            Add to Cart
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        menuContainer.appendChild(categoryDiv);
    }
}

// Load menu on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMenuItems);
} else {
    loadMenuItems();
}
</script>
