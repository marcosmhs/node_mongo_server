const express = require('express');
const mongoose = require('mongoose');
const consts = require('../../consts');
const  bcryptjs = require('bcryptjs');
require('../../models/User');
const User = mongoose.model('users');
const passport = require('passport')

function form(req, res, formState) {
    if (formState == consts.formState.create)
        res.render('user/form', {formState: formState});
    else {
        User.findOne({_id: req.params.id}).then((user) => {
            res.render('user/form', {user: user, formState: formState});
        }).catch((error)=>{
            req.flash('error_message', 'Usuário não encontrrado. ' + error);
            res.redirect('/');
        });
    }
}

function createOrUpdate(req, res) {
    const errors = [];

    const user = new User({
        _id: req.body._id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    if (!user.name || typeof user.name  == undefined || user.name == null || user.name == '')
        errors.push({text: 'Nome não informado'})
    
    if (user.name.length < 3) 
        errors.push({text: 'Nome deve possuir 3 ou mais letras'})

    if (!user.email || typeof user.email  == undefined || user.email == null || user.email == '')
        errors.push({text: 'E-mail não informado'})
    
    if (user.email.length < 3) 
        errors.push({text: 'E-mail deve possuir 3 ou mais letras'})        
    
    if (!user.password || typeof user.password  == undefined || user.password == null || user.password == '')
        errors.push({text: 'Senha não informado'})
    
    if (user.email.length < 5) 
        errors.push({text: 'Senha deve possuir 5 ou mais caracteres'})

    if (req.body.formState == consts.formState.create) {
        if (req.body.password != req.body.password_2)
            errors.push({text: 'As senhas informadas não são iguais'})        
    } else {
        User.findOne({email: user.email, _id: {$nw: user._id}}).then((user) => {
            if (user) {
                errors.push({text: 'Já existe um usuário com este e-mail'})
            }
        }).catch((error) => {
            errors.push({text: 'Houve um erro ao tenta validar o e-mail. ('+ error + ')'})
        });
    }

    if (errors.length > 0)
        res.render('user/form', {user: user, errors: errors, formState: req.body.formState});
    else {
        if (req.body.formState == consts.formState.create) {
            User.findOne({email: user.email}).then((user) => {
                if (user) {
                    errors.push({text: 'Já existe um usuário com este e-mail'})
                    res.render('user/form', {user: user, errors: errors, formState: req.body.formState});
                }
                else {
                    bcryptjs.genSalt(10, (error, salt) => {
                        if (error) {
                            errors.push({text: 'Erro ao preparar criptografia da senha. ' + error})
                            res.render('user/form', {user: user, errors: errors, formState: req.body.formState});
                        }        
                        bcryptjs.hash(req.body.password, salt, (error, hash) => {
                            if (error) {
                                errors.push({text: 'Erro ao criptografar a senha. ' + error})
                                res.render('user/form', {user: user, errors: errors, formState: req.body.formState});                                      
                            }
                            user.password = hash;
        
                            user.save().then(() => {
                                req.flash('success_message', 'Usário regristrado com sucesso');
                                res.redirect('/');
                            }).catch((error) => {
                                req.flash('error_message', 'Ocorreu um erro ao tentar registrar o usuário. Tente novamente. (erro: ' + error.message + ')');
                                res.redirect('/');
                            });
                        });
                    });
                }
            }).catch((error) => {
                errors.push({text: 'Houve um erro ao tenta validar o e-mail. ('+ error + ')'})
            });            
        }
        else {
            User.findOne({_id: user.id}).then((updatingUser) => {
                updatingUser.name = user.name;
                updatingUser.email = user.email;
                // não deve setar a senha pois ela pode estar em branco.
                // pensar como criar rotina de redefinição de senha
                //updatingUser.password = user.password;
                updatingUser.updatedAt = Date.now();
    
                updatingUser.save().then(() => {
                    req.flash('success_message', 'Usuário atualizado com sucesso');
                    res.redirect('/');
                }).catch((error) => {
                    req.flash('error_message', 'Ocorreu um erro ao salvar os dados do usuário. Tente novamente. (erro: ' + error.message + ')');
                    res.redirect('/');
                });
            }).catch((error) => {
                req.flash('error_message', 'Ocorreu um erro ao salvar os dados do usuário. Tente novamente. (erro: ' + error.message + ')');
                res.redirect('/');
            });
        }
    }
}

function login(req, res) {
    res.render('user/login');
}

function validateUser(req, res, next) {
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    const errors = [];    

    if (!user.email || typeof user.email  == undefined || user.email == null || user.email == '')
        errors.push({text: 'E-mail não informado'})
    
    if (!user.password || typeof user.password  == undefined || user.password == null || user.password == '')
        errors.push({text: 'Senha não informada'})
        
    if (errors.length > 0)
        res.render('user/login', {errors: errors});
    else {
        passport.authenticate("local", {failureFlash: true}, (err, user, info) => {
            if (err !== null || user === false) {
                req.session.save(() => res.redirect("/user/login"));
            } else {
                req.logIn(user, err => {
                    req.session.save(() => res.redirect("/"));
                });
            }
        })(req, res, next);        
    }
}

function logout(req, res, next) {
    req.logout(function(error) {
        if (error) {
            return next(error);
        }
        req.flash('success_message', 'Você saiu da área restrita');
        res.redirect('/');
    });

}


module.exports = {
    form: form,
    createOrUpdate: createOrUpdate,
    login: login,
    validateUser: validateUser,
    logout: logout
}