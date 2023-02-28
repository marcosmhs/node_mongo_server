const passport = require('passport')
const passportLocalStrategy = require('passport-local')
const mongoose = require('mongoose');
const  bcryptjs = require('bcryptjs');
require('../../models/User');
const User = mongoose.model('users');


module.exports = function auth(passport) {
    passport.use(new passportLocalStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if (!user)
                return done(null, false, {message: 'E-mail não cadastrado'})

            bcryptjs.compare(password, user.password, (error, validated) => {
                return validated ? done(null, user) : done(null, false, {message: 'Senha incorreta'})
            })
        })
    }))
}

passport.serializeUser((user, done) => {
    console.log('serializeUser')
    console.log(user)
    console.log('--------------------------------------------------------')
    done(null, user._id)
})

passport.deserializeUser((id, done) => {
    console.log('deserializeUser')
    console.log(id)
    User.findById(id, (error, user) => {
        done(error, user)
        console.log('done')
        console.log(user)
    })
})