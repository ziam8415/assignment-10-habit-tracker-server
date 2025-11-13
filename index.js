const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

const verifyFireBaseToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("inside token", decoded);
    req.token_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@simple.v1mki5f.mongodb.net/?appName=simple`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("simple crud server is runnig");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("userDB");
    const habitCollection = database.collection("habits");

    //get data

    app.get("/allHabits", async (req, res) => {
      const cursor = habitCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get category base data

    app.get("/allHabits/:category", async (req, res) => {
      const query = {};
      console.log("category", req.params.category);
      if (req.params.category) {
        query.category = req.params.category;
      }

      const cursor = habitCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get id base
    app.get("/habit/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await habitCollection.findOne(query);
      res.send(result);
    });

    // search

    app.get("/search", async (req, res) => {
      const searchText = req.query.search;
      const result = await habitCollection
        .find({ title: { $regex: searchText, $options: "i" } })
        .toArray();
      res.send(result);
    });

    //get 6 newest data
    app.get("/newestHabits", async (req, res) => {
      const cursor = habitCollection.find().sort({ time: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    //added habit
    app.post("/addHabit", async (req, res) => {
      //console.log("headers in the post ", req.headers);
      const habit = req.body;
      console.log(habit);
      const result = await habitCollection.insertOne(habit);
      res.send(result);
    });

    //my habits (email)
    app.get("/habits", async (req, res) => {
      const query = {};
      //console.log("email", req.query.email);
      if (req.query.email) {
        query.creatorEmail = req.query.email;
      }

      const cursor = habitCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //delete

    app.delete("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await habitCollection.deleteOne(query);
      res.send(result);
    });

    //update habit

    app.patch("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const updatedHabit = req.body;
      console.log(id, updatedHabit);
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: { ...updatedHabit },
      };
      const result = await habitCollection.updateOne(query, update);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`simple crud server is running on port ${port}`);
});
