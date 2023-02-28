const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Post = new Schema({
    title: {
        type: String, require: true, unique: true,
    },
    text: {
        type: String, require: true,
    },
    urlSlug: {
        type: String, require: true, unique: true,
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'categories',
        require: true,
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

mongoose.model('posts', Post)