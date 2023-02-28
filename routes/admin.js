const express = require('express');
const router = express.Router();

const categoryController = require('./controllers/category');
const postController = require('./controllers/post');
const consts = require('../consts');

const {isAdmin} = require('../helpers/isAdmin');

// categories
router.get('/category', isAdmin, (req, res) => categoryController.list(req, res));

router.get('/category/create', isAdmin, (req, res) => categoryController.form(req, res, consts.formState.create));

router.get('/category/update/:id', isAdmin, (req, res) => categoryController.form(req, res, consts.formState.update));

router.post('/category/createOrUpdate', isAdmin, (req, res) => categoryController.createOrUpdate(req, res));

router.post('/category/remove', isAdmin, (req, res) => categoryController.remove(req, res));

// posts

router.get('/post', isAdmin, (req, res)=> postController.list(req, res));

router.get('/post/create', isAdmin, (req, res) => postController.form(req, res, consts.formState.create));

router.get('/post/update/:id', isAdmin, (req, res) => postController.form(req, res, consts.formState.update));

router.post('/post/createOrUpdate', isAdmin, (req, res) => postController.createOrUpdate(req, res));

router.post('/post/remove', isAdmin, (req, res) => postController.remove(req, res));

module.exports = router;