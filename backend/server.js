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


// Create a middleware that throws errors, if the errormode is toggled on. This helps us prototype error handling.
let errormode = false;
const errormodeMiddleware = (req, res, next) => {
    if (errormode) {
        res.status(500).send({error: "Throwing because errormode is on!"})
    }
    else {
        next();
    }
};
app.use("/todos", errormodeMiddleware);

// in-memory data(base)
let todos = [{id: 1, text: 'learn react', completed: false}];

let idSeq = 1;

// routes
app.get('/todos', (req, res) => res.send(todos));

app.post('/todos', (req, res) => {
    idSeq += 1;
    todos.push({id: idSeq, text: req.body, completed: false});
    console.log("todo added, current todos are", todos);
    res.send(String(idSeq));
});

app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    todos = todos.filter(t => t.id !== todoId);
    console.log("todo deleted, current todos are", todos);
    res.send(null);
});

app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log("updating todo", id);
    const index = todos.findIndex(t => t.id === id);
    if (!index) {
        console.log("todo not found with id", id, "current todos are", todos);
    }
    todos[index].completed = !todos[index].completed;
    res.send(null);
});

// just for testing, toggle errormode, where the backend throws errors for all the calls
app.put('/errormode', (req, res) => {
    errormode = !errormode;
    console.log("errormode is now", errormode);
    res.send(errormode);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));