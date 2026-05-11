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
    } catch (error) {
      console.error('ADD TODO: ', error);
      return res.status(500);
    }
  },
  getAllTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;

    try {
      const result = await Todo.find({ user_id: user_id })
        .sort({ date: 1 })
        .select('-user_id -__v'); // __v sert à permettre à plusieurs personne d'ouvrir un meme todo en meme temps

      return res.status(200).json(result);
    } catch (error) {
      console.error('GET ALL TODO: ', error);
      return res.status(500).send();
    }
  },
  editTodo: async (req, res) => {
    const user_id = req.sub;
    const query = { id: req.params.id, user_id: user_id };
    const data = req.body;
    const { Todo } = req.app.locals.models;

    try {
      const todo = await Todo.findOne({ _id: todo_id, user_id: user_id });
      if (result) {
        todo.completed = typeof data.completed !== 'undefined' ? data.completed : todo.completed;
        todo.text = data.text || todo.text;
        todo.date = data.date || todo.date;

        const result = await todo.save();

        await result.save();
        return res.status(200).json(result);
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('UPDATE TODO: ', error);
      return res.status(500).send();
    }
  },
  deleteTodo: async (req, res) => {
    const user_id = req.sub;
    const todo_id = req.params.id;
    //const query = { id: todo_id, user_id: user_id };
    const { Todo } = req.app.locals.models;

    try {
      const result = await Todo.findOneAndDelete({ _id: todo_id, user_id: user_id });

      if (result) {
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
        $text: { $search: searchString }
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
