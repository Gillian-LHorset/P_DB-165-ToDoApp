const mongoose = require('mongoose');

const TodoController = {
  createTodo: async (req, res) => {
    const user_id = req.sub;
    const { text, date } = req.body;
    const { Todo } = req.app.locals.models;

    try {
      const result = await Todo.create({
        text: text,
        date: date,
        completed: false,
        user_id: user_id
      });
      
      const redisClient = req.app.locals.redis;
      if (redisClient) {
        await redisClient.del(`todos:${user_id}`);
      }
      
      return res.status(201).json(result);
    } catch (error) {
      console.error('ADD TODO: ', error);
      return res.status(500).send();
    }
  },
  getAllTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;
    const redisClient = req.app.locals.redis;

    try {
      if (redisClient) {
        const cachedTodos = await redisClient.get(`todos:${user_id}`);
        if (cachedTodos) {
          return res.status(200).json(JSON.parse(cachedTodos));
        }
      }

      const result = await Todo.find({ user_id: user_id })
        .sort({ date: 1 })
        .select('-user_id -__v');

      if (redisClient) {
        await redisClient.set(`todos:${user_id}`, JSON.stringify(result), { EX: 3600 });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('GET ALL TODO: ', error);
      return res.status(500).send();
    }
  },
  editTodo: async (req, res) => {
    const user_id = req.sub;
    const todo_id = req.params.id;
    const data = req.body;
    const { Todo } = req.app.locals.models;

    try {
      if (!mongoose.Types.ObjectId.isValid(todo_id)) {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }

      const todo = await Todo.findOne({ _id: todo_id, user_id: user_id });
      if (todo) {
        todo.completed = typeof data.completed !== 'undefined' ? data.completed : todo.completed;
        todo.text = data.text || todo.text;
        todo.date = data.date || todo.date;

        const result = await todo.save();

        const redisClient = req.app.locals.redis;
        if (redisClient) {
          await redisClient.del(`todos:${user_id}`);
        }

        return res.status(200).json(result);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      console.error('UPDATE TODO: ', error);
      return res.status(500).send();
    }
  },
  deleteTodo: async (req, res) => {
    const user_id = req.sub;
    const todo_id = req.params.id;
    const { Todo } = req.app.locals.models;

    try {
      if (!mongoose.Types.ObjectId.isValid(todo_id)) {
        return res.status(400).json({ error: 'Invalid todo ID' });
      }

      const result = await Todo.findOneAndDelete({ _id: todo_id, user_id: user_id });

      if (result) {
        const redisClient = req.app.locals.redis;
        if (redisClient) {
          await redisClient.del(`todos:${user_id}`);
        }
        return res.status(200).json({ id: todo_id });
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      console.error('DELETE TODO: ', error);
      return res.status(500).send();
    }
  },
  getSearchTodo: async (req, res) => {
    const user_id = req.sub;
    //const query = req.query.q;
    const searchString = req.query.q;
    const { Todo } = req.app.locals.models;

    try {
      const result = await Todo.find({
        user_id: user_id,
        text: { $regex: searchString, $options: 'i' }
      })
        .sort({ date: 1 })
        .select('-user_id -__v');

      return res.status(200).json(result);
    } catch (error) {
      console.error('SEARCH TODO: ', error);
      return res.status(500).send();
    }
  }
};

module.exports = TodoController;
