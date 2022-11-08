const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());



app.listen(port,() => {
    console.log(`Example app listening at http://localhost:${port}`)
}) 