const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
    res.send('Server is healthy');
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gribm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Database connected successfully");

        const database = client.db('visitnature');
        const servicesCollection = database.collection('services');
        const bookingsCollection = database.collection('booking');

        // GET API - All Services
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
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

        // POST API - Add New Service
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // POST API - Add Booking
        app.post('/services/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        });

        // DELETE SERVICE
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });

        // DELETE BOOKING
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

    } finally {
        // client.close() করলে কানেকশন বন্ধ হয়ে যাবে, তাই এটি বন্ধ রাখা হয়েছে
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Visit Nature Server is running');
});

app.listen(port, () => {
    console.log('Server is running on port:', port);
});
