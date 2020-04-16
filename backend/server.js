const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json({strict: false})); // for parsing application/json

// Create artificial "load" so that the loading state is clearly visible
const sleepMiddleware = (req, res, next) => {
    setTimeout(() => next(), 1000);
};
app.use(sleepMiddleware);


// in-memory data(base)
let todos = [{id: 1, text: 'learn react', completed: false}];
let idSeq = 1;


// routes
app.get('/todos', (req, res) => res.send(todos));

app.post('/todos', (req, res) => {
    idSeq += 1;
    todos.push({id: idSeq, text: req.body, completed: false});
    res.send(String(idSeq));
});

app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    todos = todos.filter(t => t.id !== todoId);
    res.send(null);
});

app.put('/todos/:id', (req, res) => {
    const index = todos.findIndex(t => t.id === parseInt(req.params.id, 10));
    todos[index].completed = !todos[index].completed;
    res.send(null);
});


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));