// main system file

// ----------------------------------
// imports
// ----------------------------------
const express = require('express');
const handlebars = require('express-handlebars');
const bodyparser = require('body-parser');
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

const postController = require('./routes/controllers/post');
 
const passport = require('passport')
require("./routes/controllers/auth")(passport)

// ----------------------------------
// general config
// ----------------------------------
const port = process.env.port || 8081;
app = express();

// session
app.use(session({
    secret: 'secret_key_that_should_be_created',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 60000, secure: false}
}));

app.use(passport.initialize())
app.use(passport.session())

//flash
app.use(flash());

//middleware
app.use((req, res, next) => {
    res.locals.success_message = req.flash("success_message");
    res.locals.error_message = req.flash("error_message");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    // req.user é algo criado pelo passport para ajudar na autenticação e controle de acesso
    res.locals.user = req.user || null;

    next();
});


// bodyparser
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json())

// handlebars

app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions:{
        allowProtoPropertiesByDefault:true,
        allowedProtoMethodsByDefault:true
    },
    helpers: {
        ifStr: (v1, v2, options) => {
            return (v1.toString() === v2.toString())  ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');

// ----------------------------------
// mongo
// ----------------------------------
mongoose.set('strictQuery', false)
mongoose.Promise = global.Promise
var url = 'mongodb+srv://system:system@marcosmhs.q0n1p9n.mongodb.net/mysystem';
mongoose.connect(
    url
).then( () => {
    console.log('Conectado com o MongoDB em marcosmhs.q0n1p9n.mongodb.net/mysystem');
}
).catch((error)=>  {
    console.log('Error ao se conectar com MongoDB em marcosmhs.q0n1p9n.mongodb.net/mysystem: ' + error);
}
);

// ----------------------------------
// routes
// ----------------------------------
app.use('/admin', adminRoutes)
app.use('/user', userRoutes)

app.get('/', (req, res) => postController.homePosts(req, res));
app.get('/post/:urlSlug', (req, res) => postController.getSinglePost(req, res));

app.listen(port, () => console.log('Server running at http://localhost:' + port));