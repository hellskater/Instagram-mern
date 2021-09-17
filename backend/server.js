import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import posts from "./dbModel.js";

// App config
const app = express();
const port = process.env.PORT || 8000;

const pusher = new Pusher({
  
});

// Middlewares
app.use(express.json());
app.use(cors());

// DB config
const connection_url =
  "mongodb+srv://admin:<password>@cluster0.ft3c0.mongodb.net/instadb?retryWrites=true&w=majority";
mongoose.connect(connection_url, (err) => {
  if (err) throw err;
  console.log("connected to MongoDB");
});

mongoose.connection.once("open", () => {
  const changeStream = mongoose.connection.collection("posts").watch();

  changeStream.on("change", (change) => {
    console.log("ChangeStream Triggered. Change...");
    console.log(change);
    console.log("End of Change");

    if (change.operationType === "insert") {
      console.log("Triggering Pusher ***IMG UPLOAD***");

      const postDetails = change.fullDocument;
      pusher.trigger("posts", "inserted", {
        user: postDetails.user,
        caption: postDetails.caption,
        image: postDetails.image,
      });
    } else {
      console.log("Unknown trigger from pusher");
    }
  });
});

// API routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.post("/upload", (req, res) => {
  const dbObj = req.body;

  posts.create(dbObj, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/upload", (req, res) => {
  posts.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// Listeners
app.listen(port, () => console.log(`listening on localhost:${port}`));
