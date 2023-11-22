const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

const port = 3000;

const connectDB = require("./connectMongo");

connectDB();

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  favoriteCities: [{ id: Number, cityName: String }],
  limitTemperature: { type: Number },
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://heating-advisor.vercel.app"],
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"],
    credentials: true,
  })
);

// Обробка реєстрації
app.post("/register", (req, res) => {
  const { username, password, favoriteCities, limitTemperature } = req.body;
  const newUser = new User({
    username,
    password,
    favoriteCities,
    limitTemperature,
  });

  User.findOne({ username }).then((user) => {
    if (user) {
      res.status(401).json({ message: "Користувач з таким ім'ям вже існує" });
    } else {
      newUser
        .save()
        .then(() => {
          res.json({ message: "Реєстрація успішна" });
        })
        .catch((err) => {
          console.error("Помилка реєстрації:", err);
          res.status(400).json({ message: "Помилка при реєстрації" });
        });
    }
  });
});

app.post("/login", (req, res) => {
  const { username } = req.body;

  User.findOne({ username })
    .then((user) => {
      if (user) {
        res.json({
          username: user.username,
          favoriteCities: user.favoriteCities,
        });
      } else {
        res.status(401).json({ message: "Не вдалося знайти користувача" });
      }
    })
    .catch((err) => {
      console.error("Помилка під час логіну:", err);
      res.status(500).json({ message: "Помилка під час логіну" });
    });
});

app.get("/userData/:username", (req, res) => {
  console.log("req", req);
  const username = req.params.username;

  User.findOne({ username })
    .then((user) => {
      if (user) {
        res.json({
          favoriteCities: user.favoriteCities,
          limitTemperature: user.limitTemperature,
        });
      } else {
        res.status(401).json({ message: "Не вдалося знайти користувача" });
      }
    })
    .catch((err) => {
      console.error("Помилка під час отримання даних користувача", err);
      res
        .status(500)
        .json({ message: "Помилка під час отримання даних користувача" });
    });
});

app.delete("/removeCity", (req, res) => {
  const { username, cityName } = req.body;

  console.log("remove", req.body);
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Користувача не знайдено" });
      }

      const indexToDelete = user.favoriteCities.findIndex(
        (city) => city.cityName === cityName
      );

      if (indexToDelete !== -1) {
        user.favoriteCities.splice(indexToDelete, 1);
        console.log(`Місто ${cityName} було видалено.`);
      } else {
        console.log(`Місто ${cityName} не знайдено.`);
      }

      console.log("user.favoriteCities", user.favoriteCities);

      user
        .save()
        .then(() => {
          res.json({ message: "Місто видалено" });
        })
        .catch((err) => {
          console.error("Помилка під час оновлення користувача:", err);
          res
            .status(500)
            .json({ message: "Помилка під час оновлення користувача" });
        });
    })
    .catch((err) => {
      console.error("Помилка під час пошуку користувача:", err);
      res.status(500).json({ message: "Помилка під час пошуку користувача" });
    });
});

app.post("/addCity", (req, res) => {
  const { username, cityName } = req.body;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Користувача не знайдено" });
      }

      const maxId = Math.max(...user.favoriteCities.map((city) => city.id));
      const newCityId = maxId + 1;

      const city = {
        id: newCityId,
        cityName: cityName,
      };

      user.favoriteCities.push(city);

      user
        .save()
        .then(() => {
          res.json({ message: "Місто успішно додано" });
        })
        .catch((err) => {
          console.error("Помилка під час оновлення користувача:", err);
          res
            .status(500)
            .json({ message: "Помилка під час оновлення користувача" });
        });
    })
    .catch((err) => {
      console.error("Помилка під час пошуку користувача:", err);
      res.status(500).json({ message: "Помилка під час пошуку користувача" });
    });
});

app.patch("/updateLimitTemperature", (req, res) => {
  const { username, limitTemperature } = req.body;
  console.log("username", username, limitTemperature);

  User.updateOne({ username }, { $set: { limitTemperature } })
    .then((result) => {
      if (result.modifiedCount > 0) {
        res.json({ message: "limitTemperature оновлено успішно" });
      } else {
        res
          .status(404)
          .json({ message: "Не вдалося знайти користувача або немає змін" });
      }
    })
    .catch((err) => {
      console.error("Помилка при оновленні limitTemperature:", err);
      res
        .status(500)
        .json({ message: "Помилка при оновленні limitTemperature" });
    });
});

app.listen(port, () => {
  console.log(`Сервер успішно запущено на порті ${port}`);
});
