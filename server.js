const express = require("express");
const userrouter = require("./router/user");
const courserouter = require("./router/course");
const Uploadrouter = require("./router/media");
const webhookattach=require('./router/webhookrouter')
const purchaserouter = require("./router/purchasecourse");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const mongodb = require("./config/mongodb");
mongodb.connect();

app.use(cookieParser());

// ✅ Stripe webhook must come before body-parsing middleware

app.use('/api/v1/coursepurchase', webhookattach);
// Now parse JSON for all other routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "https://e-learning-student-pwiq-s2tzyhpyb-anshu-rajs-projects-92c5d5d7.vercel.app",
    credentials: true,
  })
);

// cors({
//   origin: "*  ||      ",
//   credentials: true,
// })


app.use('/api/v1/user', userrouter);
app.use('/api/v1/uploadmedia', Uploadrouter);
app.use('/api/v1/course', courserouter);
app.use('/api/v1/coursepurchase', purchaserouter);



app.get("/health", (req, res) => res.status(200).send("OK"));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`App is running at ${port}`);
});
