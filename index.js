const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

//simpleDbUser
//CQDl671xKw94KCzI
const uri =
  "mongodb+srv://simpleDbUsers:CQDl671xKw94KCzI@simple.v1mki5f.mongodb.net/?appName=simple";

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
    // app.get("/habits", async (req, res) => {
    //   const cursor = habitCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

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

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await habitCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
