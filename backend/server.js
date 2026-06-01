const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory store
let todos = [];

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json({ success: true, data: todos });
});

// GET single todo
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
  res.json({ success: true, data: todo });
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const todo = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.status(201).json({ success: true, data: todo });
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Todo not found' });

  const { title, description, completed } = req.body;
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title cannot be empty' });
  }

  todos[index] = {
    ...todos[index],
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(completed !== undefined && { completed }),
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, data: todos[index] });
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Todo not found' });
  todos.splice(index, 1);
  res.json({ success: true, message: 'Todo deleted' });
});

// DELETE all todos (for test cleanup)
app.delete('/api/todos', (req, res) => {
  todos = [];
  res.json({ success: true, message: 'All todos deleted' });
});

// Serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
