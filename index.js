const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Health Check API
app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

// মঙ্গোডিবি কানেকশন লিঙ্ক (Updated Cluster ID: lypouw8)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lypouw8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // কানেক্ট করার চেষ্টা
        await client.connect();
        console.log("Database connected successfully to Cluster0");

        // ডাটাবেস এবং কালেকশন নাম (Screenshot অনুযায়ী visit-nature)
        const database = client.db('visit-nature'); 
        const servicesCollection = database.collection('services');
        const bookingsCollection = database.collection('booking');

        // --- API Routes ---

        // GET ALL SERVICES
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET ALL BOOKINGS
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET SINGLE SERVICE BY ID
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

        // POST - Add New Service
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // POST - Add Booking
        app.post('/services/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        });

        // DELETE Service
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });

        // DELETE Booking
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

    } catch (error) {
        console.error("Connection Error:", error);
    }
    // client.close() ব্যবহার করা হয়নি যেন কানেকশন সচল থাকে
}
run().catch(console.dir);

// Root API
app.get('/', (req, res) => {
    res.send('Visit Nature Server is running');
});

app.listen(port, () => {
    console.log('Server is running on port:', port);
});
