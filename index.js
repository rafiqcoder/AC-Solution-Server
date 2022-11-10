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

// verify token
function verifyJWT(req,res,next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('No token provided');
        return;
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_SECRET_TOKEN,function (err,decoded) {
        if (err) {
            res.status(403).send('Invalid token');
            return;
        }
        req.decoded = decoded;
        next();

    })
}

async function run() {
    // connect to the MongoDB services database
    const Services = client.db('AcSolutions').collection('Services');
    // connect to the MongoDB reviews database
    const Reviews = client.db('AcSolutions').collection('Reviews');

    try {
        //// Services CRUD
        // posting added services
        app.post('/add-service',async (req,res) => {
            const service = req.body;
            const result = await Services.insertOne(service);
            console.log(result);
            res.send({
                message: 'success',
                data: result,
            });
        })
        // getting all services
        app.get('/services',async (req,res) => {
            const cursor = Services.find({}).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        // getting 3 services
        app.get('/home',async (req,res) => {
            const cursor = Services.find({}).sort({ _id: -1 }).limit(3);
            const result = await cursor.toArray();
            res.send(result);
        });
        // getting a single service
        app.get('/services/:id',async (req,res) => {
            // destructure the id from the params
            const { id } = req.params;
            //  search for the service by id
            const query = { _id: ObjectId(id) };
            // get the service
            const cursor = Services.find(query);
            const result = await cursor.toArray();

            // get the reviews
            const cursor2 = Reviews.find({ serviceId: id }).sort({ reviewTime: -1 }).sort({ _id: -1 });
            const result2 = await cursor2.toArray();
            res.send({
                message: 'success',
                services: result,
                reviews: result2,
            })

        });
        // adding reviews
        app.post('/add-review',async (req,res) => {
            const review = req.body;
            const result = await Reviews.insertOne(review);
            console.log(result);
            res.send({
                message: 'success',
                data: result,
            });
        });

        // get reviews by veryfing the token
        app.get('/reviews',verifyJWT,async (req,res) => {
            const email = req.query.email;

            const decoded = req.decoded;
            // check if the email is the same as the email in the token
            if (decoded.email !== email) {
                res.status(403).send('Forbidden');
                return;
            }

            let query = {};
            if (email) {
                query = { email: email };

            }
            // get the reviews by email
            const cursor = Reviews.find(query).sort({ reviewTime: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // delete a review
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
        // update a review
        app.patch('/review-update/:id',async (req,res) => {
            const { id } = req.params;
            const updatedMsg = req.body;

            const query = { _id: ObjectId(id) };
            const result = await Reviews.updateOne(query,{ $set: updatedMsg });

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

        // send the token
        app.post('/jwt',(req,res) => {
            const user = req.body;
            const token = jwt.sign(user,process.env.ACCESS_SECRET_TOKEN,{ expiresIn: '1d' });
            res.send({ token });
        });

    } finally {
        // await client.close();

    }


}
run().catch(error => console.error(error));

app.listen(port,() => {
    console.log(`Example app listening at http://localhost:${port}`)
}) 