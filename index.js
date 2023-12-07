const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

//middleware here
app.use(express.json());
app.use(cors())


// replace username(${process.env.DB_USER}) and password(${process.env.DB_PASS}) here

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jobportal.a2ilieo.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER2}:${process.env.DB_PASS2}@cluster0.dhokyox.mongodb.net/?retryWrites=true&w=majority`;

async function initializeMongoClient() {
  const client = new MongoClient(uri, {
      serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
      }
  });

  try {
      client.connect();
      return client;
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
  }
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const client = await initializeMongoClient();

    const db =  client.db("jobPortal");
    const jobsCollection =  db.collection("jobs");
    const usersCollection =  db.collection("users");
    const applyCollection =  db.collection("applied");

    // Creating index for job sorting last job posted will show first
    const indexKeys = { title: 1, category: 1 }; 
    const indexOptions = { name: "titleCategory" }; 
    const result = await jobsCollection.createIndex(indexKeys, indexOptions);
    // console.log(result);

    // post a job
    
    
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});