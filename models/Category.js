const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const Category = new Schema({
    name: {
        type: String, require: true, unique: true
    },
    urlSlug: {
        type: String, require: true, unique: true,
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

mongoose.model('categories', Category)