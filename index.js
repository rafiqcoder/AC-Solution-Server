const express = require('express');
const cors = require('cors');
const { MongoClient,ServerApiVersion,ObjectId,MongoCursorInUseError } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1rvc7ql.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri,{ useNewUrlParser: true,useUnifiedTopology: true,serverApi: ServerApiVersion.v1 });

async function run() {
    const Services = client.db('AcSolutions').collection('Services');
    const Reviews = client.db('AcSolutions').collection('Reviews');
    
    try {
        app.post('/add-service',async (req,res) => {
            const service = req.body;
            const result = await Services.insertOne(service);
            console.log(result);
            res.send({
                message: 'success',
                data: result,
            });
        })
        app.get('/services',async (req,res) => {
            const cursor = Services.find({}).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/home',async (req,res) => {
            const cursor = Services.find({}).sort({ _id: -1 }).limit(3);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/services/:id',async (req,res) => {
            const { id } = req.params;

            const query = { _id: ObjectId(id) };
            const cursor = Services.find(query);
            const result = await cursor.toArray();
            const cursor2 = Reviews.find({ serviceId: id }).sort({ reviewTime: -1 });
            const result2 = await cursor2.toArray();
            res.send({
                message: 'success',
                services: result,
                reviews: result2,
            })

        });
        app.post('/add-review',async (req,res) => {
            const review = req.body;
            const result = await Reviews.insertOne(review);
            console.log(result);
            res.send({
                message: 'success',
                data: result,
            });
        });
        // get reviews by email
        app.get('/reviews',async (req,res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = Reviews.find(query).sort({ reviewTime: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.delete('/reviews/:id',async (req,res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await Reviews.deleteOne(query);
            if (result.deletedCount > 0) {
                res.send({
                    message: 'deleted',
                    data: result,
                });
            } else {
                res.send({
                    message: 'error',
                });
            }

        });
        app.patch('/review-update/:id',async (req,res) => {
            const { id } = req.params;
            const updatedMsg = req.body;


            const query = { _id: ObjectId(id) };
            const result = await Reviews.updateOne(query,{ $set: updatedMsg });
            console.log(result);
            if (result.modifiedCount > 0) {
                res.send({
                    message: 'updated',
                    data: result,
                });
            } else {
                res.send({
                    message: 'error',
                });
            }


        });


    } finally {
        // await client.close();

    }


}
run().catch(error => console.error(error));

app.listen(port,() => {
    console.log(`Example app listening at http://localhost:${port}`)
}) 