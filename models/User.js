const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String, require: true,
    },
    email: {
        type: String, require: true, unique: true
    },
    password: {
        type: String, require: true,
    },
    admin: {
        type: Boolean, require: true,
        default: false,
    },    
    createdAt: {
        type: Date, 
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }    
});

mongoose.model('users', User)