import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 5000

const dataFilePath = path.join(__dirname, 'todo.json');

// load todos from file

const loadTodos = async () => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
        return []
    }
}

// save todos to file

const saveTodos = async (todos) => {
    await fs.writeFile(dataFilePath, JSON.stringify(todos, null, 2), 'utf8');
}

const app = express();

app.use(express.json());
app.use(cors());

const taskRouter = express.Router();

// const port = 5000;

// const tasks = [];

// { 'id': 82, 'title': 'coding', 'description': 'done', 'Status': 'pending' },

taskRouter.get('/tasks', async (req, res) => {
    const allTasks = await loadTodos();

    try {
        if (!allTasks) return res.status(404).json({ error: "There is no task available in database" })
        
        return res.status(200).json(allTasks)
    }
    catch (error) {
        return res.status(500).json({error: "Something went wrong!"})
    }
})

taskRouter.get('/tasks/:id', (req, res) => {
    const Id = parseInt(req.params.id);

    try {
        if (!Id) return res.status(400).json({ error: "the id parameter is missing in the url" });

        const aTask = tasks.filter(task => task.id === Id);

        if (!aTask) return res.status(404).json({ error: "there is no such task present in the database" });

        return res.status(200).json({ message: { aTask } });
    }
    catch (error) {
        return res.status(500).json({ error: "Something went wrong" });
    }
})

taskRouter.post('/tasks/add', async (req, res) => {

    const todos = await loadTodos();
    const newTask = req.body;

    console.log('req.body in post',req.body);

    const title = newTask.title;

    try {
        if (!title) return res.status(400).json({ error: "title is required. please enter a title" });

        // tasks.push(newTask)
        todos.push(newTask);

        await saveTodos(todos);

        // console.log('post task',tasks);

        return res.status(200).json({message: {"title": newTask.title, "description": newTask.description}})
    }
    catch (error) {
        res.status(500).json({error : "Something went wrong!"})
    }
})

taskRouter.put('/tasks/edit/:id', async (req, res) => {
    const Id = parseInt(req.params.id);
    const newTask = req.body;
    console.log('update body', newTask);
    const tasks = await loadTodos();

    try {
        if (!Id) return res.status(400).json({ error: "the id parameter is missing in the url" });

        const taskIndex = tasks.findIndex(task => task.id === Id); 

        if (!newTask.title) return res.status(400).json({ error: 'Title is required!' })
        if (!newTask.Status) return res.status(400).json({error: 'Status is required!'})
        
        tasks[taskIndex].title = newTask.title;
        tasks[taskIndex].description = newTask.description;
        tasks[taskIndex].Status = newTask.Status;

        await saveTodos(tasks);

        return res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({error : "Something went wrong!"})
    }
})

taskRouter.delete('/tasks/delete/:id', async (req, res) => {
    const Id = parseInt(req.params.id);
    console.log(Id);
    const tasks = await loadTodos();

    try {
        if (!Id) return res.status(400).json({ error: "the id parameter is missing in the url" });

        const taskIndex = tasks.findIndex(task => task.id === Id);  // find the index of required element.

        if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

        tasks.splice(taskIndex, 1); // removes element and upates the original array.

        await saveTodos(tasks);

        return res.status(200).json(tasks);
    }
    catch (error) {
        return res.status(500).json({ error: "Something went wrong" });
    }
})

app.use('/api', taskRouter);

// serve static react files

// app.use(express.static(path.join(__dirname, '../client/build')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// })

app.listen(PORT, () => {
    console.log('Server is running on', PORT);
})
