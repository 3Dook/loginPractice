const express = require('express')
const path = require('path');
const session = require('express-session')
const bodyParser = require('body-parser')
const ejsMate = require('ejs-mate');
const User = require('./models/user')
const flash = require('connect-flash')
const methodOverride = require('method-override')

// Comment out if production - for environment variables
require('dotenv').config();


// Configurations
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(flash())
app.use(methodOverride('_method'))
// DATABASE 
const mongoose = require('mongoose')
// default local db is set to mongodb://localhost:27017/
let dbLocation = process.env.DBLOCATION || 'mongodb://localhost:27017/'
dbLocation = dbLocation + 'testingUsers'
mongoose.connect
    (dbLocation,
    {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to database");
    })
    .catch(err => {
        console.log("Cannot connect to database", err);
    });

// SESSION SET UP
const sessionConfig = {
    secret: 'ThisIsasecretMcsecretFace',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))

//PASSPORT 
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// ROUTES
app.use('/user', require('./routes/user'));
app.use('/', (req, res)=>{
    res.render('home.ejs')
})


//console.log(process.env)
let port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running on "localhost: ${[port]}" || Enter ctr^c to close server`);
});