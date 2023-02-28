const express = require('express');
const router = express.Router();

const userController = require('./controllers/user');
const consts = require('../consts');

router.get('/signin', (req, res)=> userController.form(req, res, consts.formState.create));

router.get('/edit', (req, res)=> userController.form(req, res, consts.formState.update));

router.post('/createOrUpdate', (req, res) => userController.createOrUpdate(req, res));

router.get('/login', (req, res) => userController.login(req, res));

router.post('/validateUser', (req, res, next) => userController.validateUser(req, res, next));

router.get  ('/logout', (req, res, next) => userController.logout(req, res, next));

module.exports = router;