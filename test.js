const http = require('http');

// Test configuration
const HOST = 'localhost';
const PORT = 3000;
const BASE_URL = `http://${HOST}:${PORT}`;

// Test helper functions
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Test functions
const testHealthCheck = async () => {
  console.log('Testing health check...');
  const response = await makeRequest('GET', '/health');
  console.log(`Status: ${response.statusCode}`);
  console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
  console.log('✓ Health check passed\n');
};

const testCreateTodo = async () => {
  console.log('Testing create todo...');
  const todoData = {
    title: 'Test Todo',
    description: 'This is a test todo'
  };
  
  const response = await makeRequest('POST', '/todos', todoData);
  console.log(`Status: ${response.statusCode}`);
  console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
  console.log('✓ Create todo passed\n');
  
  return response.body.data;
};

const testGetAllTodos = async () => {
  console.log('Testing get all todos...');
  const response = await makeRequest('GET', '/todos');
  console.log(`Status: ${response.statusCode}`);
  console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
  console.log('✓ Get all todos passed\n');
  
  return response.body.data;
};

const testGetTodoById = async (id) => {
  console.log(`Testing get todo by id ${id}...`);
  const response = await makeRequest('GET', `/todos/${id}`);
  console.log(`Status: ${response.statusCode}`);
  console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
  console.log('✓ Get todo by id passed\n');
  
  return response.body.data;
};

const testUpdateTodo = async (id) => {
  console.log(`Testing update todo ${id}...`);
  const updateData = {
    title: 'Updated Test Todo',
    description: 'This todo has been updated',
    completed: true
  };
  
  const response = await makeRequest('PUT', `/todos/${id}`, updateData);
  console.log(`Status: ${response.statusCode}`);
  console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
  console.log('✓ Update todo passed\n');
  
  return response.body.data;
};

const testDeleteTodo = async (id) => {
  console.log(`Testing delete todo ${id}...`);
  const response = await makeRequest('DELETE', `/todos/${id}`);
  console.log(`Status: ${response.statusCode}`);
  console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
  console.log('✓ Delete todo passed\n');
};

const testErrorHandling = async () => {
  console.log('Testing error handling...');
  
  // Test 404 for non-existent todo
  const response404 = await makeRequest('GET', '/todos/999');
  console.log(`404 Test - Status: ${response404.statusCode}`);
  console.log(`404 Test - Response: ${JSON.stringify(response404.body, null, 2)}`);
  
  // Test 400 for invalid todo creation
  const response400 = await makeRequest('POST', '/todos', { title: '' });
  console.log(`400 Test - Status: ${response400.statusCode}`);
  console.log(`400 Test - Response: ${JSON.stringify(response400.body, null, 2)}`);
  
  console.log('✓ Error handling tests passed\n');
};

// Run all tests
const runTests = async () => {
  console.log('=== Starting Todo API Tests ===\n');
  
  try {
    await testHealthCheck();
    const createdTodo = await testCreateTodo();
    await testGetAllTodos();
    await testGetTodoById(createdTodo.id);
    await testUpdateTodo(createdTodo.id);
    await testGetAllTodos();
    await testDeleteTodo(createdTodo.id);
    await testGetAllTodos();
    await testErrorHandling();
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Check if server is running before running tests
const checkServer = async () => {
  try {
    await makeRequest('GET', '/health');
    console.log('Server is running, starting tests...\n');
    await runTests();
  } catch (error) {
    console.log('Server is not running. Please start the server first with: npm start');
    process.exit(1);
  }
};

checkServer();