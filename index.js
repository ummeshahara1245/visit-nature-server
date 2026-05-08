const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const uri = `mongodb+srv://admin:admin2026@cluster0.lypouw8.mongodb.net/visitnature?retryWrites=true&w=majority`;

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
        console.log("Database Connected Successfully ✅");

        const database = client.db('visitnature');
        
        // আপনার দেওয়া একদম সঠিক কালেকশন নাম:
        const servicesCollection = database.collection('services'); // বহুবচন (s আছে)
        const bookingsCollection = database.collection('booking');  // একবচন (s নেই)

        // --- 1. SERVICES API ---

        // সব সার্ভিস পাওয়ার জন্য
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // সিঙ্গেল সার্ভিস ডিটেইলস
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

        // সার্ভিস অ্যাড করা
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // সার্ভিস ডিলিট করা
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });


        // --- 2. BOOKING API ---

        // নতুন বুকিং সেভ করা
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        });

        // নির্দিষ্ট ইউজারের বুকিং দেখা
        app.get('/myBookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        // সব বুকিং দেখা (Admin)
        app.get('/bookings', async (req, res) => {
            const result = await bookingsCollection.find({}).toArray();
            res.send(result);
        });

        // বুকিং ডিলিট করা
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

        // স্ট্যাটাস আপডেট করা
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: { status: 'Approved' },
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

    } catch (error) {
        console.error("Database Connection Error ❌:", error);
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Visit Nature Server is Running 🌲');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
