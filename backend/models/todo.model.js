module.exports = (mongoose) => {
  const todoSchema = new mongoose.Schema(
    {
      text: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        required: false,
        default: null
      },
      completed: {
        type: Boolean,
        required: true,
        default: false
      },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    },
    {
      timestamps: true
    }
  );

  todoSchema.index({ text: 'text' });

  return mongoose.model('Todo', todoSchema);
};
