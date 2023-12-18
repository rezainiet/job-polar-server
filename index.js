const express = require('express');
const { MongoClient, ServerApiVersion, Timestamp, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
const nodemailer = require('nodemailer');

require('dotenv').config(); // Load environment variables from .env file

const transporter = nodemailer.createTransport({
  host: 'mail.jobpolar.com',
  port: 465,
  secure: true, // Set to true for SSL/TLS
  auth: {
    user: process.env.EMAIL_USER || 'no-reply@jobpolar.com',
    pass: process.env.EMAIL_PASS || 'YourEmailPassword',
  },
});


const JobConfirmEmailTemplate = (name, email, companyName, designation) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Application Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f0f0;
            /* Light gray background */
            margin: 0;
            padding: 0;
            text-align: center;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            /* White container background */
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        h1 {
            font-family: 'Times New Roman', serif;
            color: #3498db;
            /* Blue heading */
            margin-bottom: 20px;
        }

        p {
            font-family: 'Verdana', sans-serif;
            color: #333;
            /* Dark gray text */
            line-height: 1.6;
        }

        ul {
            font-family: 'Georgia', serif;
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }

        li {
            margin-bottom: 10px;
            color: #555;
            /* Medium gray list item text */
        }

        .button {
            font-family: 'Courier New', monospace;
            display: inline-block;
            font-weight: bold;
            padding: 12px 24px;
            background-color: #3498db;
            /* Blue button */
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .button:hover {
            background-color: #2c3e50;
            /* Darker blue on hover */
        }

        .footer {
            font-family: 'Arial', sans-serif;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            color: #888;
            /* Light gray footer text */
            font-size: 12px;
        }

        .footer a {
            color: #3498db;
            /* Blue footer link */
            text-decoration: none;
        }

        .company-logo {
            max-width: 100px;
            margin: 20px auto;
        }

        .hero-image {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 8px;
        }
    </style>
</head>

<body>
    <div class="container">
        <img class="hero-image" src="https://i.ibb.co/ZBdqmnJ/job-polar-banner.png" alt="JobPolar Logo">
        <h1>Job Application Confirmed</h1>
        <p>Dear ${name},</p>
        <p>Congratulations! Your job application has been confirmed by the job poster on JobPolar. Here are the details:
        </p>
        <ul>
            <li><strong>Job Title:</strong> ${designation}</li>
            <li><strong>Company:</strong> ${companyName}</li>
            <li><strong>Application Status:</strong> Confirmed</li>
        </ul>
        <p>You can contact the job poster for further details or arrangements. Thank you for using JobPolar!</p>
        <a class="button" href="https://jobpolar.com/dashboard" target="_blank">Visit JobPolar</a>
        <p>Best regards,<br>JobPolar Team</p>
        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@jobpolar.com">support@jobpolar.com</a></p>
        </div>
        <img class="company-logo" src="https://i.ibb.co/XZJq3BP/job-Polar-logo.png" alt="Company Logo">
    </div>
</body>

</html>`
}

const OfferLetterEmailTemplate = (name, userEmail, companyName, designation, startDate, link) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Offer Letter</title>
    <style>
        /* Add your custom styles here */
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        h1 {
            font-family: 'Times New Roman', serif;
            color: #3498db;
            margin-bottom: 20px;
        }

        p {
            font-family: 'Verdana', sans-serif;
            color: #333;
            line-height: 1.6;
        }

        ul {
            font-family: 'Georgia', serif;
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }

        li {
            margin-bottom: 10px;
            color: #555;
        }

        .button {
            font-family: 'Courier New', monospace;
            display: inline-block;
            font-weight: bold;
            padding: 12px 24px;
            background-color: #3498db;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .button:hover {
            background-color: #2c3e50;
        }

        .footer {
            font-family: 'Arial', sans-serif;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            color: #888;
            font-size: 12px;
        }

        .footer a {
            color: #3498db;
            text-decoration: none;
        }

        .company-logo {
            max-width: 100px;
            margin: 20px auto;
        }

        .hero-image {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 8px;
        }
    </style>
</head>

<body>
    <div class="container">
        <img class="hero-image" src="https://i.ibb.co/ZBdqmnJ/job-polar-banner.png" alt="Banner">
        <h1>Job Offer Letter</h1>
        <p>Dear ${name},</p>
        <p>Congratulations! We are pleased to extend an offer for the position of ${designation} at ${companyName}.
            Here are the details:</p>
        <ul>
            <li><strong>Job Title:</strong> ${designation}</li>
            <li><strong>Start Date:</strong> ${startDate}</li>
            <!-- Add more details as needed -->
        </ul>
        <p>Please review the attached offer letter for more information. If you have any questions or require further
            clarification, feel free to contact us.</p>
        <a class="button" download='offer_letter.jpg' href=${link} target="_blank">View/Download Offer Letter</a>
        <p>We look forward to welcoming you to the ${companyName} team!</p>
        <div class="footer">
            <p>If you need assistance, please contact us at <a
                    href="mailto:support@jobpolar.com">support@jobpolar.com</a></p>
        </div>
        <img class="JobPolar-logo" src="https://i.ibb.co/XZJq3BP/job-Polar-logo.png" alt="Job_Polar_Logo">
    </div>
</body>

</html>`
}

const LMIAEmailTemplate = (name, referenceNo, designation, companyName, link) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LMIA Approval Notification</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        h1 {
            font-family: 'Times New Roman', serif;
            color: #3498db;
            margin-bottom: 20px;
        }

        p {
            font-family: 'Verdana', sans-serif;
            color: #333;
            line-height: 1.6;
        }

        ul {
            font-family: 'Georgia', serif;
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }

        li {
            margin-bottom: 10px;
            color: #555;
        }

        .button {
            font-family: 'Courier New', monospace;
            display: inline-block;
            font-weight: bold;
            padding: 12px 24px;
            background-color: #3498db;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .button:hover {
            background-color: #2c3e50;
        }

        .footer {
            font-family: 'Arial', sans-serif;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            color: #888;
            font-size: 12px;
        }

        .footer a {
            color: #3498db;
            text-decoration: none;
        }

        .company-logo {
            max-width: 100px;
            margin: 20px auto;
        }

        .hero-image {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 8px;
        }
    </style>
</head>

<body>
    <div class="container">
        <img class="hero-image" src="https://i.ibb.co/ZBdqmnJ/job-polar-banner.png" alt="Banner">
        <h1>LMIA Approval Notification</h1>
        <p>Dear ${name},</p>
        <p>We are delighted to inform you that your Labour Market Impact Assessment (LMIA) application has been
            approved. Congratulations!</p>
        <ul>
            <li><strong>LMIA Reference Number:</strong> ${referenceNo}</li>
            <li><strong>Job Title:</strong> ${designation}</li>
            <li><strong>Company:</strong> ${companyName}</li>
            <!-- Add more details as needed -->
        </ul>
        <p>The approval of your LMIA means that you can proceed with the next steps in your employment process. We will
            provide further instructions and details shortly.</p>
        <a class="button" download='labour_market_impact_assessment.jpg' href=${link} target="_blank">View/Download Offer Letter</a>
        <p>Should you have any questions or require additional information, please do not hesitate to contact us.</p>
        <p>Thank you for choosing ${companyName}. We look forward to welcoming you to our team!</p>
        <div class="footer">
            <p>If you need assistance, please contact us at <a
                    href="mailto:support@jobpolar.com">support@jobpolar.com</a></p>
        </div>
        <img class="company-logo" src="https://i.ibb.co/XZJq3BP/job-Polar-logo.png" alt="Logo">
    </div>
</body>

</html>`
}


async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: 'Job Polar <no-reply@jobpolar.com>',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}



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
  const db = client.db("jobPortal");
  const jobsCollection = db.collection("jobs");
  const usersCollection = db.collection("users");
  const applyCollection = db.collection("applied");
  const messageCollection = db.collection("messages");

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
  app.delete("/job/:id", async (req, res) => {
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

  app.post('/register-user', async (req, res) => {
    const data = req.body;
    const result = await usersCollection.insertOne(data);
    res.status(200).send({ message: "User registered successful.", success: true })
  });

  app.get('/users', async (req, res) => {
    const query = {};
    const result = await usersCollection.find(query).toArray();
    res.send(result);
  })


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

  app.get('/get-applied-jobs/:email', async (req, res) => {
    const email = req.params.email;
    // console.log(email);
    const query = { userEmail: email };
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

  app.get('/applied-job-details/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const result = await applyCollection.findOne({ jobID: id });
    res.send(result);
  });

  app.post('/messages', async (req, res) => {
    const message = req.body;
    const result = await messageCollection.insertOne(message);
    res.send(result);
  });
  app.get('/messages/:email', async (req, res) => {
    const id = req.params.email;
    const email = req.params.email;
    const querybyId = { jobId: id };

    // Using toArray() on find is not necessary, as find returns a cursor
    const result = await messageCollection.find(querybyId).toArray();

    res.send(result);
  });


  app.get('/messages', async (req, res) => {
    const messages = await messageCollection.find({}).toArray();

    // Organize messages by jobId
    const messagesByJobId = {};

    messages.forEach((message) => {
      const jobId = message.jobId;

      if (!messagesByJobId[jobId]) {
        messagesByJobId[jobId] = [];
      }

      messagesByJobId[jobId].push({
        id: message._id,
        jobId: message.jobId,
        sender: message.sender,
        content: message.content,
        time: message.time,
        isRead: message.isRead,
        photoUrl: message.photoUrl,
        user: message.user,
      });
    });

    res.send(messagesByJobId);
  });
  app.delete('/message/delete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await messageCollection.deleteOne(query);
    res.send(result);
  });


  app.post('/send-job-approved-email/:email', async (req, res) => {


    // Send a confirmation email
    const userEmail = req.params.email;
    const userName = 'Masud Reza';
    const companyName = 'BuildWell Constructions';
    const designation = 'Construction Worker';
    const subject = 'Job Application Confirmation';
    const html = JobConfirmEmailTemplate(userName, userEmail, companyName, designation);

    sendEmail(userEmail, subject, html);

    res.status(200).send({ message: 'Email Sent successfully.', success: true });
  });


  app.post('/send-offer-letter', async (req, res) => {
    // Extract email from route parameters
    // const userEmail = req.params.email;
    const data = req.body;

    // Hardcoded or dynamically retrieve other details like name, companyName, designation
    const name = data?.userName;
    const userEmail = data?.email;
    const companyName = data?.companyName;
    const designation = data?.jobTitle;
    const startDate = data?.startDate;
    const link = data?.offerLetter;

    // Set the subject for the email
    const subject = `Job Offer Letter for ${name}`;

    // Generate HTML for the email using your template function
    const html = OfferLetterEmailTemplate(name, userEmail, companyName, designation, startDate, link);

    // Send the email
    sendEmail(userEmail, subject, html);

    // Send a response indicating success
    res.status(200).send({ message: 'Offer letter sent successfully.', success: true });
  });

  app.post('/send-lmia-notification', async (req, res) => {
    // Extract necessary data from the request body
    const { name, referenceNo, designation, companyName, link, userEmail } = req.body;

    // Set the subject for the email
    const subject = `LMIA Approval Notification ${name}`;

    // Generate HTML for the email using your template function
    const html = LMIAEmailTemplate(name, referenceNo, designation, companyName, link);

    // Send the email
    sendEmail(userEmail, subject, html);

    // Send a response indicating success
    res.status(200).send({ message: 'LMIA Notification sent successfully.', success: true });
  });





  app.get('/', (req, res) => {
    res.send('App is running on a secure server? The answer is Yeah!');
  });

  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });
}

run().catch(console.dir);
