const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `MONGO_URI=mongodb+srv://admin:admin2026@cluster0.lypouw8.mongodb.net/visitnature?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Connected to Database");

        const database = client.db('visitnature');
        const servicesCollection = database.collection('services');
        const bookingsCollection = database.collection('booking');

        // --- SERVICES API ---

        // ১. সব সার্ভিস দেখার জন্য (Home Page)
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // ২. সিঙ্গেল সার্ভিস দেখার জন্য (Booking Page)
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

        // ৩. নতুন সার্ভিস অ্যাড করার জন্য (Admin Dashboard)
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // ৪. সার্ভিস ডিলিট করার জন্য (Admin Dashboard)
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });


        // --- BOOKING API ---

        // ৫. নতুন বুকিং সেভ করার জন্য
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        });

        // ৬. সব বুকিং দেখার জন্য (Manage All Orders - Admin)
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // ৭. নির্দিষ্ট ইউজারের বুকিং দেখার জন্য (My Orders)
        app.get('/myBookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = bookingsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // ৮. বুকিং স্ট্যাটাস আপডেট করার জন্য (Pending to Approved)
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: 'Approved'
                },
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // ৯. বুকিং ডিলিট করার জন্য (Cancel Order)
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Visit Nature Server is Running');
});

app.listen(port, () => {
    console.log('Server is running on port:', port);
});
