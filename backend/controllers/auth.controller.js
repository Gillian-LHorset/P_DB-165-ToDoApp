const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/keys');

// remove password from user object
const cleanUser = (user) => {
  const userObj = user.toObject();
  // eslint-disable-next-line no-unused-vars
  const { password, __v, ...cleanedUser } = userObj;
  return cleanedUser;
};

const AuthController = {
  loginUser: async (req, res) => {
    const { User } = req.app.locals.models;
    const email = req.body.email.toLowerCase();

    try {
      const result = await User.findOne({ email: email });
      if (result) {
        const isMatch = await bcrypt.compare(req.body.password, result.password);

        if (isMatch) {
          const user = cleanUser(result);
          const token = jsonwebtoken.sign({}, JWT_SECRET, {
            subject: result.id.toString(),
            expiresIn: 60 * 60 * 24 * 30 * 6,
            algorithm: 'RS256'
          });
          return res.status(200).json({ user: user, token: token });
        } else {
          return res.status(400).json({
            message: 'Mauvais email ou mot de passe!'
          });
        }
      } else {
        return res.status(404).json({
          message: "Ce compte n'existe pas !"
        });
      }
    } catch (error) {
      console.error('LOGIN USER: ', error);
      return res.status(500).json({ message: 'Erreur technique' });
    }
  }
};

module.exports = AuthController;
