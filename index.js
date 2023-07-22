const express = require('express');
const mongoose = require('mongoose');
const hbs = require('hbs');
const path = require('path');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}))
dotenv.config();

// auth
const checkAuth = require('./src/middlewares/checkAuth');

// database connection
const db = require('./src/db/connection');

// collections
const employeeCollection = require('./src/models/employee');

// paths
const staticPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');

// template engine
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// static files
app.use(express.static(staticPath));

// homepage
app.get('/', (req, res)=>{
    res.render('index',{
        title: "Home - Employes",
    })
})

// register page
app.get('/registration', (req, res)=>{
    res.render('registration', {
        title: "Registration - Employes"
    })
})

// create new user
app.post('/registration', async(req, res)=>{
    try{
        const {firstName, lastName, email, password, gender, confirmPassword, phone} = req.body;

        if(password === confirmPassword){
            const registerEmployee = new employeeCollection({
                firstName,
                lastName,
                email,
                phone,
                gender,
                password
            });
            const result = await registerEmployee.save();
            const authToken = await jwt.sign({
                _id: result._id,
                firstName: result.firstName
            }, process.env.Auth_Secret_Key);
            console.log(authToken);
            res.status(201).redirect('/');
        }else{
            console.log("not saved")
            res.status(400).send("password not matched")
        }
    }catch(err){
        res.status(400).send(err)
    }
});

// login page
app.get('/login', checkAuth, (req, res)=>{
    res.render('login',{
        title: "Login - Employes"
    })
})

// login validation
app.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;
        const userdata = await employeeCollection.findOne({email:email});
        const passwordValidity = await bcrypt.compare(password, userdata.password);
        if(passwordValidity === true){
            const authToken = await jwt.sign({
                _id: userdata._id,
                firstName: userdata.firstName
            }, process.env.Auth_Secret_Key);
            console.log(authToken);
            res.status(201).redirect('/')
        }else{
            res.status(400).send("wrong login info")
        }
    }catch(err){
        console.log("login error", err)
        res.status(400).send("wrong login info")
    }
})

app.listen(port, ()=>{
    console.log("The server is running at the port ",port)
})

