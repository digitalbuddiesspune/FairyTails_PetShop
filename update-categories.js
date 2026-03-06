// Simple script to update Dogs category with Collar and Leash subcategories
// Run this with: node update-categories.js

// API base URL - check your backend .env for PORT (default is 3000)
const API_BASE = 'http://localhost:3000/api/v1';

async function updateDogsCategory() {
  try {
    console.log('🔄 Updating Dogs category with Collar and Leash...');
    console.log(`📡 Connecting to: ${API_BASE}/categories/seed`);
    
    // Use seed endpoint which will reset all categories with the new structure
    const seedResponse = await fetch(`${API_BASE}/categories/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!seedResponse.ok) {
      const text = await seedResponse.text();
      console.error('❌ Server response:', text.substring(0, 200));
      throw new Error(`Server returned ${seedResponse.status}: ${seedResponse.statusText}`);
    }
    
    const seedData = await seedResponse.json();
    
    if (seedData.success) {
      console.log('✅ Success! All categories reseeded with Collar and Leash.');
      console.log('📋 Total categories:', seedData.data.length);
      const dogsCategory = seedData.data.find(cat => cat.slug === 'dogs');
      if (dogsCategory) {
        console.log('🐕 Dogs subcategories:', dogsCategory.subcategories.map(s => s.name).join(', '));
      }
    } else {
      console.error('❌ Failed:', seedData.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your backend server is running (npm start in backend folder)');
    console.log('   2. The server is on port 3000 (check backend/.env file)');
    console.log('   3. Your database is connected');
  }
}

updateDogsCategory();
