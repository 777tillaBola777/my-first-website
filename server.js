
require('dotenv').config();
const express = require('express')

const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/user");
const flash = require('connect-flash')
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const db = require('./helpers/database')
const path = require("path");




const passport = require("passport");

const { menuItems } = require('./data')

const app = express()


app.get("/login-success", (re, res, next) => {
  const indexFileName = path.join(__dirname, "login-success.html");
  res.sendFile(indexFileName);
});

app.get("/login-failure", (re, res, next) => {
  const indexFileName = path.join(__dirname, "login-failure.html");
  res.sendFile(indexFileName);
});

const sessionOptions = {
    key: "session_cookie_name",
    secret: "session_cookie_secret",
    store: new MySQLStore({
      host: "localhost",
      port: 3306,
      user: "root",
      database: "cookie_user",
      password: "123456",
      insecureAuth: true,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  };
  
  app.use(session(sessionOptions));
  

  console.log("Express server ishga tushmoqda...");

  
  app.set("view engine", "ejs");
  app.set("views", "views");
  app.use(flash())
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());

 
  //app.use(cors());
  const cors = require('cors');

// This will allow requests from http://localhost:3000, allowing both GET and POST methods
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all methods your API will use
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Allow cookies and authentication headers
}));

// For preflight requests (OPTIONS)
app.options('*', cors());
 

console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
console.log('Stripe Publishable Key:', process.env.STRIPE_PUBLISHABLE_KEY);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



  // Load environment variables from .env file

  // Check if the STRIPE_SECRET_KEY is loaded correctly

   // Should print the secret key or 'undefined' if not loaded

  
  
  
  //const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser.json());

  const customerFields = {
    usernameField: "uname",
    passwordField: "pw",
  };

  function validPassword(password, hash, salt){
    const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 60, "sha512")
    .toString("hex");
  // console.log('true or false', hashVerify, hash)
    return hash === hashVerify;
  }

  async function verifyCallBack(username, password, done) {
    const result = await db.query("SELECT * FROM own_work.users WHERE username = ? ", [
      username
    ]);
    //console.log('chiqdi',username,password, result[0])
  
    if (result[0].length == 0) {
      return done(null, false);
    }
  
    const isValid = validPassword(
      password,
      result[0][0]?.hash,
      result[0][0]?.salt
    );
    const user = {
      id: result[0][0]?.id,
      username: result[0][0]?.username,
      hash: result[0][0]?.hash,
      salt: result[0][0]?.salt,
    };
  
    if(isValid && result[0][0]?.blocked === 'true') {
      const message = { message: `${user?.username} is blocked`  }
      console.log(result[0], 'blocked', message)
      return done(null, false, message);
    } else if (isValid) {
      console.log('valid')
      return done(null, user);
    } else {
      console.log('Incorrect username or password.' )
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }


  const strategy = new LocalStrategy(customerFields, verifyCallBack) 

  passport.use(strategy)

  passport.serializeUser((user, done) => {
    console.log("inside serialize");
    done(null, user.id);
  });
  
  passport.deserializeUser(async function (userId, done) {
    const result = await db.execute("SELECT * FROM pro.users WHERE id = ?", [
      userId,
    ]);
  
    if(result[0]){
      done(null, result[0])
    } else {
      done(null, false)
    }
  
    
    console.log('deserialize')
  });

  let isAdmin = false;

// middleware controller
app.get("/*", (req, res, next) => {
  if (req.path.match(/^\/admin\//)) {
    //console.log("Admin sahifasi");
    isAdmin = true;
  } else {
    //console.log("Mehmon sahifasi");
    isAdmin = false;
  }
  next();
});

// Ensure you have 'stripe' properly initialized with your secret key

/*app.post('/create-payment-intent', async (req, res) => {
  try {
    const amount = 1000; // Set amount in cents; could be dynamic based on req.body.amount
    console.log("Creating PaymentIntent for amount:", amount);

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });  // Send a JSON response with the error message
    }

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: 'usd',
    });

    console.log("PaymentIntent created successfully:", paymentIntent); // Log PaymentIntent details
    res.json({ clientSecret: paymentIntent.client_secret }); // Return clientSecret to client
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);  // Log error to the console
    res.status(500).json({ error: error.message });  // Send error message as JSON response
  }
  
});*/
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || isNaN(amount)) {
      return res.status(400).send({ error: 'Invalid amount' });
  }

  try {
      const paymentIntent = await stripe.paymentIntents.create({
          amount: parseInt(amount, 10), // Ensure this is an integer
          currency: currency || 'usd',
          payment_method_types: ['card'],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
      console.error('Stripe Error:', err);
      res.status(500).send({ error: 'Failed to create payment intent' });
  }
});




app.get('/get-stripe-key', (req, res) => {
  // Return publishable key to client for Stripe.js initialization
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});


app.get('/ping', (req, res) => res.send(process.env.STRIPE_PUBLISHABLE_KEY));
  app.use("/admin", adminRouter.router);
  app.use(shopRouter);
  app.listen(3000)