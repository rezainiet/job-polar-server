const express = require('express');
const { MongoClient, ServerApiVersion, Timestamp, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
// app.use('/send/:email', limiter);
require('dotenv').config();

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
    const client = await initializeMongoClient();
    const db =  client.db("jobPortal");
    const jobsCollection =  db.collection("jobs");
    const usersCollection =  db.collection("users");
    const applyCollection =  db.collection("applied");

    const indexKeys = { title: 1, category: 1 }; 
    const indexOptions = { name: "titleCategory" }; 
    const result = await jobsCollection.createIndex(indexKeys, indexOptions);

    app.post("/post-job", async (req, res) => {
        const body = req.body;
        body.createdAt = new Date();
        // console.log(body);
        const result = await jobsCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });


      // get all jobs 
    app.get("/all-jobs", async (req, res) => {
      const jobs = await jobsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(jobs.reverse());
    });

    // get single job using id
    app.get("/all-jobs/:id", async (req, res) => {
      // console.log(req.params.id);
      const jobs = await jobsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(jobs);
    });

    // get jobs based on email for my job listing 
    app.get("/myJobs/:email", async (req, res) => {
      // console.log("email---", req.params.email);
      const jobs = await jobsCollection
        .find({
          postedBy: req.params.email,
        })
        .toArray();
      res.send(jobs);
    });


    // delete a job
    app.delete("/job/:id", async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(filter);
      res.send(result);
    })

    // updata a job
    app.patch("/update-job/:id", async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      // console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
            ...jobData
        },
      };
      const options = { upsert: true };
      const result = await jobsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.post('/register-user', async (req, res) =>{
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.status(200).send({message: "User registered successful.", success: true})
    });


    app.post('/apply-for-job', async (req, res) => {
      try {
        const data = req.body;
    
        // Insert the application data into MongoDB
        const result = await applyCollection.insertOne(data);
    
        // Send a success response
        res.status(200).json({
          success: true,
          message: 'Job application submitted successfully!',
          // The inserted document
          // data: result.ops[0], 
        });
      } catch (error) {
        console.error('Error during job application submission:', error);
    
        // Send an error response
        res.status(500).json({
          success: false,
          message: 'Failed to submit job application. Please try again later.',
        });
      }
    });

    app.get('/get-applied-jobs/:email', async (req, res) =>{
      const email = req.params.email;
      // console.log(email);
      const query = {userEmail: email};
      const result = await applyCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/job-details/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await jobsCollection.findOne({ _id: new ObjectId(id) });
    
        if (!result) {
          // Handle the case where no job details are found for the given ID
          return res.status(404).send('Job not found');
        }
    
        // Send the result with a 200 status
        res.status(200).send(result);
      } catch (error) {
        // Handle any errors that occur during the database query
        console.error('Error retrieving job details:', error);
        res.status(500).send('Internal Server Error');
      }
    });




    app.get('/', (req, res) => {
        res.send('App is running on a secure server? The answer is Yeah!');
    });

    app.listen(port, () => {
        console.log(`App is running on port ${port}`);
    });
}

run().catch(console.dir);
