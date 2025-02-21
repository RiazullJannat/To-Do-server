require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(express.json())
app.use(cors())

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e3b4z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const usersCollection = client.db('to-do').collection("users");
        const toDoCollection = client.db('to-do').collection("toDo");
        app.post('/register', async (req, res) => {
            const data = req.body;
            const isExist = await usersCollection.findOne({ email: data.email });
            if (isExist) {
                return res.send({ message: 'user already exist.', insertedId: null })
            }
            const result = await usersCollection.insertOne(data)
            res.send(result)
        })
        app.post('/to-do', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await toDoCollection.insertOne(data)
            res.send(result)
        })
        app.patch('/update-todo', async (req, res) => {
            const data = req.body;
            const { id } = req.query;
            const filter = {_id: new ObjectId(id)}
            const updatedDoc = {
                $set:{
                    ...data
                }
            }
            const result = await toDoCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        app.get('/to-do-list', async (req, res) => {
            const { email } = req.query
            const result = await toDoCollection.find({ userEmail: email }).toArray();
            res.send(result)
        })
    } finally {
    }
}
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
run().catch(console.dir);