const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for todos
let todos = [];
let nextId = 1;

// Helper function to find todo by id
const findTodoById = (id) => {
  return todos.find(todo => todo.id === parseInt(id));
};

// Helper function to create a new todo
const createTodo = (title, description = '') => {
  const now = new Date().toISOString();
  return {
    id: nextId++,
    title,
    description,
    completed: false,
    created_at: now,
    updated_at: now
  };
};

// Routes

// GET /todos - Get all todos
app.get('/todos', (req, res) => {
  res.json({
    success: true,
    data: todos,
    total: todos.length
  });
});

// POST /todos - Create a new todo
app.post('/todos', (req, res) => {
  const { title, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }

  const newTodo = createTodo(title.trim(), description?.trim() || '');
  todos.push(newTodo);

  res.status(201).json({
    success: true,
    data: newTodo
  });
});

// GET /todos/:id - Get a specific todo
app.get('/todos/:id', (req, res) => {
  const todo = findTodoById(req.params.id);
  
  if (!todo) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found'
    });
  }

  res.json({
    success: true,
    data: todo
  });
});

// PUT /todos/:id - Update a todo
app.put('/todos/:id', (req, res) => {
  const todo = findTodoById(req.params.id);
  
  if (!todo) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found'
    });
  }

  const { title, description, completed } = req.body;
  
  if (title !== undefined) {
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title cannot be empty'
      });
    }
    todo.title = title.trim();
  }
  
  if (description !== undefined) {
    todo.description = description?.trim() || '';
  }
  
  if (completed !== undefined) {
    todo.completed = Boolean(completed);
  }
  
  todo.updated_at = new Date().toISOString();

  res.json({
    success: true,
    data: todo
  });
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  const todoIndex = todos.findIndex(todo => todo.id === parseInt(req.params.id));
  
  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found'
    });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];

  res.json({
    success: true,
    data: deletedTodo
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Todo API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo API server is running on port ${PORT}`);
});

module.exports = app;