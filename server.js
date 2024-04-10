const expressAsyncHandler = require("express-async-handler");
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
let ppath = path.join(__dirname);
app.use(bodyParser.json());

// Step 1: Define Mongoose schema
const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        expires: '30s',
        default: Date.now
    }
});
// Step 2: Create Mongoose model
const Email = mongoose.model('Email', emailSchema);

app.get('/', (req, res)=> {
    res.sendFile(`${ppath}/send.html`);
})
app.get('/verify', (req,res)=> {
    res.sendFile(`${ppath}/verify.html`);
})
const generateOTP = () => {
    return Math.floor(1000+Math.random()*8999).toString(); // Ensure OTP is a string
}
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'akshat2276.be21@chitkara.edu.in',
        pass: "qxwx knhh wipy hmqg"
    }
})

// Step 4: Modify sendMail function to save email and OTP to the database
const sendMail = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send("Email address is required");
    }
    const Otp = generateOTP();
    const mail = {
        to: email,
        from: "akshat2276.be21@chitkara.edu.in",
        subject: "OTP from me",
        text: `Your otp is: ${Otp}`
    }
    transporter.sendMail(mail, async function (err, info) {
        if (err) {
            console.error(err);
            return res.status(500).send("Failed to send email");
        } else {
            console.log('Email sent Successfully!!');
            // Step 4 (continued): Save email and OTP to MongoDB
            try {
                await Email.create({ email, otp: Otp });
                res.sendFile(`${ppath}/verify.html`);
                // return res.status(200).send("Email sent successfully");
            } catch (error) {
                console.error(error);
                return res.status(500).send("Failed to save email and OTP to database");
            }
        }
    });
});
app.post('/send', sendMail);
app.post('/verify', async (req, res) => {
    const  otp  = req.body.otp;
    if (!otp) {
        return res.status(400).send("OTP is required");
    } try {
        const storedEmail = await Email.findOne({  otp });
        if (storedEmail) {
            return res.status(200).send("OTP verified successfully");
        } else {
            return res.status(400).send("Invalid email or OTP");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});
// const port = 3000;
// app.listen(port, ()=> {
//     console.log(`server started at ${port}`)
// });
mongoose.connect(`mongodb://127.0.0.1:27017/otp`)
  .then(() => {app.listen(5000,()=>{
    console.log("started");
})})
