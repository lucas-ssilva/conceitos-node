const express = require('express');
const cors = require('cors');
 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(x => x.username == username);

  if(!user) {
      return response.status(404).json({error: "user dont exist"}); 
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkUsername = users.some(x => x.username == username);

  if(checkUsername) {
    return response.status(400).json({error: "username has already been taken"});
}

  users.push({ 
    id: uuidv4(),
    name, 
    username,
    todos: []
  });

  const user = users.find(x => x.name === name);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = { 
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const index = user.todos.findIndex(x => x.id === id);

  if(index == -1) {
    return response.status(404).json({error: "todo dont exist"})
  };

  user.todos[index].title = title; 
  user.todos[index].deadline = deadline; 

  return response.status(200).json(user.todos[index]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(x => x.id === id);

  if(index == -1) {
    return response.status(404).json({error: "todo dont exist"})
  };

  user.todos[index].done = true;

  return response.status(201).json(user.todos[index]);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(x => x.id === id);

  if(index == -1) {
    return response.status(404).json({error: "todo dont exist"})
  };

  user.todos = [];

  return response.status(204).send();
});

module.exports = app;