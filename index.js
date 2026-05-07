const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // ObjectId ইমপোর্ট নিশ্চিত করুন
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// সঠিক কানেকশন স্ট্রিং
const uri = "mongodb://admin:admin2026@cluster0-shard-00-00.lypouw8.mongodb.net:27017,cluster0-shard-00-01.lypouw8.mongodb.net:27017,cluster0-shard-00-02.lypouw8.mongodb.net:27017/visitnature?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to Database ✅"); // এটি আসলে বুঝবেন কাজ হয়েছে

        const database = client.db('visitnature');
        const servicesCollection = database.collection('services');
        const bookingsCollection = database.collection('booking');

        // ১. সব সার্ভিস দেখার জন্য
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // ২. সিঙ্গেল সার্ভিস দেখার জন্য (বুকিং পেজ)
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }; // new যোগ করা হয়েছে
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

        // ৩. বুকিং সেভ করার জন্য
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        });

        // ৪. নির্দিষ্ট ইউজারের বুকিং দেখার জন্য
        app.get('/myBookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        // ৫. বুকিং ডিলিট করার জন্য
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }; // new যোগ করা হয়েছে
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

    } finally {
        // কানেকশন খোলা রাখা হয়েছে
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Visit Nature Server is Running');
});

app.listen(port, () => {
    console.log('Server is running on port:', port);
});
