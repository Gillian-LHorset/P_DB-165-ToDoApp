module.exports = (mongoose) => {
  const userSchema = new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
      },
      password: {
        type: String,
        required: true
      },
      name: String,
      address: String,
      zip: Number,
      location: String
    },
    {
      timestamps: true
    }
  );

  return mongoose.model('User', userSchema);
};
