const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function findTodo(todos, id) {
  const todoFound = todos.find(t => t.id === id)

  if (!todoFound) { throw new Error('Invalid todo') }

  return todoFound
}

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers

  const userFound = users.find(u => u.username === username)

  if (!userFound) {
    res.status(400).send({ message: 'Invalid username' })
  }

  req.user = userFound

  next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userFound = users.find(u => u.username === username)

  if (userFound) {
    return res.status(400).json({ error: 'Username not available' })
  }

  const newUser = {
    id: v4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return res.status(201).json(newUser)
})

app.get('/todos', checksExistsUserAccount, (req, res) => {
  return res.json(req.user.todos)
})

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body

  const newTodo = {
    id: v4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  req.user.todos.push(newTodo)

  return res.status(201).json(newTodo)
})

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params
  const { title, deadline } = req.body
  const { todos } = req.user

  let todoFound
  
  try {
    todoFound = findTodo(todos, id);
  }
  catch (err) {
    return res.status(404).json({ error: err })
  }

  todoFound.title = title
  todoFound.deadline = new Date(deadline)

  return res.status(201).json(todoFound)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params
  const { todos } = req.user

  let todoFound

  try {
    todoFound = findTodo(todos, id);
  }
  catch (err) {
    return res.status(404).json({ error: err })
  }

  todoFound.done = true

  return res.status(201).json(todoFound)
})

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params
  const { todos } = req.user

  let todoFound

  try {
    todoFound = findTodo(todos, id);
  }
  catch (err) {
    return res.status(404).json({ error: err })
  }

  todos.splice(todoFound, 1)

  return res.status(204).json(todos)
});


module.exports = app;