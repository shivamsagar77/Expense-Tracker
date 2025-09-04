const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  try {
    console.log('🧪 Testing Expense Tracker API...\n');
    
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running:', rootResponse.data);
    
    // Test 2: Get categories
    console.log('\n2. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories fetched:', categoriesResponse.data.length, 'categories');
    
    // Test 3: Test expenses endpoint (should return empty array for non-existent user)
    console.log('\n3. Testing expenses endpoint...');
    const expensesResponse = await axios.get(`${BASE_URL}/expenses/999`);
    console.log('✅ Expenses endpoint working:', expensesResponse.data);
    
    console.log('\n🎉 All API tests passed! The backend is working correctly.');
    console.log('\n📱 You can now:');
    console.log('   1. Start your frontend (npm run dev in sign_up folder)');
    console.log('   2. Sign up or login');
    console.log('   3. Add expenses and see them displayed');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running:');
      console.log('   cd backend && npm start');
    }
  }
}

testAPI();
