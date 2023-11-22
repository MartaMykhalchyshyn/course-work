const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://martamykhalchyshyn:kvQijY8ALyAeNn62@cluster0.xn4vskz.mongodb.net/heating-advisor?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Підключено до MongoDB");
  } catch (error) {
    console.log("Помилка підключення до MongoDB: " + error.message);
  }
};

module.exports = connectDB;