const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testJWTFlow() {
  try {
    console.log('🧪 Testing JWT Authentication Flow...\n');

    // 1. Test signup
    console.log('1. Testing signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123'
    };

    const signupResponse = await axios.post(`${BASE_URL}/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('Token received:', signupResponse.data.token ? 'Yes' : 'No');
    console.log('User ID:', signupResponse.data.user.id);
    console.log('');

    // 2. Test login
    console.log('2. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('User ID:', loginResponse.data.user_id);
    console.log('');

    // 3. Test protected route without token
    console.log('3. Testing protected route without token...');
    try {
      await axios.get(`${BASE_URL}/categories`);
      console.log('❌ Should have failed without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    console.log('');

    // 4. Test protected route with token
    console.log('4. Testing protected route with token...');
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
      console.log('✅ Successfully accessed protected route with token');
      console.log('Categories count:', categoriesResponse.data.length);
    } catch (error) {
      console.log('❌ Failed to access protected route with token:', error.response?.data);
    }
    console.log('');

    // 5. Test token verification
    console.log('5. Testing token verification...');
    try {
      const verifyResponse = await axios.get(`${BASE_URL}/verify/verify`, { headers });
      console.log('✅ Token verification successful');
      console.log('User info:', verifyResponse.data.user);
    } catch (error) {
      console.log('❌ Token verification failed:', error.response?.data);
    }
    console.log('');

    console.log('🎉 JWT Authentication Flow Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testJWTFlow();
