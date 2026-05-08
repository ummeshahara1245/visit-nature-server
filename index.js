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
// আমি SRV ফরম্যাট ব্যবহার করছি কারণ Render-এ এটাই সবচেয়ে ভালো কাজ করে। 
// অবশ্যই MongoDB Atlas Network Access-এ 0.0.0.0/0 আইপি অ্যাড করে নেবেন।
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
        // ডাটাবেস কানেক্ট করা
        await client.connect();
        console.log("Database Connected Successfully ✅");

        const database = client.db('visitnature');
        const servicesCollection = database.collection('services');
        const bookingsCollection = database.collection('booking');

        // --- SERVICES API ---

        // ১. সব সার্ভিস দেখার জন্য
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // ২. সিঙ্গেল সার্ভিস ডিটেইলস (Booking Page)
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

        // ৩. নতুন সার্ভিস অ্যাড করা
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // --- BOOKING API ---

        // ৪. নতুন বুকিং সেভ করা
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        });

        // ৫. নির্দিষ্ট ইউজারের বুকিং দেখা (My Orders)
        app.get('/myBookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        // ৬. সব বুকিং দেখা (Admin - Manage Orders)
        app.get('/bookings', async (req, res) => {
            const result = await bookingsCollection.find({}).toArray();
            res.send(result);
        });

        // ৭. বুকিং ডিলিট করা
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

        // ৮. স্ট্যাটাস আপডেট (Pending to Approved)
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
    // আমরা client.close() করছি না কারণ সার্ভারটি রানিং থাকা প্রয়োজন।
}

run().catch(console.dir);

// --- Default Routes ---
app.get('/', (req, res) => {
    res.send('Visit Nature Server is Running 🌲');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
