const express = require('express');
const cors = require('cors');
const { MongoClient,ServerApiVersion,ObjectId,MongoCursorInUseError } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://AcSolutions:x7qezkoFdQPHxa7y@cluster0.1rvc7ql.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri,{ useNewUrlParser: true,useUnifiedTopology: true,serverApi: ServerApiVersion.v1 });

async function run() {
    const Services = client.db('AcSolutions').collection('Services');

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



    } finally {
        // await client.close();

    }


}
run().catch(error => console.error(error));

app.listen(port,() => {
    console.log(`Example app listening at http://localhost:${port}`)
}) 