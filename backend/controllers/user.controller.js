const bcrypt = require('bcrypt');

const cleanUser = (user) => {
  // eslint-disable-next-line no-unused-vars
  const userObj = user.toObject();
  const { password, __v, ...cleanedUser } = userObj;
  return cleanedUser;
};

const UserController = {
  createUser: async (req, res) => {
    const { email, password } = req.body;
    const { User } = req.app.locals.models;

    try {
      const newUser = await User.create({
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 8)
      });

      return res.status(201).json({ user: cleanUser(newUser) });
    } catch (error) {
      console.error('ADD USER: ', error);
      if (error && error.code === 11000) {
        return res.status(409).json({
          message: 'Un compte avec cet email existe déjà !'
        });
      }
      return res.status(500).json({ message: "Erreur lors de l'inscription !" });
    }
  },
  getUser: async (req, res) => {
    const user_id = req.sub;
    const { User } = req.app.locals.models;

    try {
      const result = await User.findById(user_id).select('-password -__v');

      if (result) {
        return res.status(200).json({ user: result });
      } else {
        return res.status(404).send(); // Ajout de .send() pour terminer la requête
      }
    } catch (error) {
      console.error('GET USER: ', error);
      return res.status(500).send();
    }
  },

  editUser: async (req, res) => {
    const user_id = req.sub;
    //const query = { id: user_id };
    const data = req.body;
    const { User } = req.app.locals.models;
    try {
      const user = await User.findById(user_id);

      if (user) {
        user.name = data.name || null;
        user.address = data.address || null;
        user.zip = data.zip || null;
        user.location = data.location || null;

        const result = await user.save();
        return res.status(200).json({ user: cleanUser(result) });
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('UPDATE USER: ', error);
      return res.status(500);
    }
  },
  deleteCurrentUser: async (req, res) => {
    const user_id = req.sub;
    //const query = { id: user_id };
    const { User } = req.app.locals.models;

    try {
      const deletedUser = await User.findByIdAndDelete(user_id);

      if (!deletedUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({ id: user_id });
    } catch (error) {
      console.error('DELETE USER: ', error);
      return res.status(500).send();
    }
  }
};

module.exports = UserController;
