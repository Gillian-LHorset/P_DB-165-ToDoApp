const UserModel = require('./user.model');
const TodoModel = require('./todo.model');

function initModels(mongoose) {
  const User = UserModel(mongoose);
  const Todo = TodoModel(mongoose);

  return { User, Todo };
}

module.exports = { initModels };
