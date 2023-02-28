const express = require('express');

// para usar mongoose externamente
const mongoose = require('mongoose');
require('../../models/Category')
require('../../models/Post')
const Category = mongoose.model('categories')
const Post = mongoose.model('posts')
const consts = require('../../consts')

function list(req, res) {
    Post.find().populate('category').sort({createdAt: 'desc'}).then(function(posts) {
        res.render('post/list', {posts: posts})
    }).catch(function(error) {
        req.flash('error_message', 'Ocorreu um erro ao localizar as postagens. Tente novamente. (erro: ' + error.message + ')');
        res.redirect('/admin/post');
    });   
}

function form(req, res, formState) {
    if (formState == consts.formState.create)
    Category.find().then((categories) => {
        res.render('post/form', {categories: categories, formState: formState});
    }).catch(() => {
        req.flash('error_message', 'Ocorreu um erro selecionar a lista de categorias. Tente novamente. (erro: ' + error.message + ')');
        res.redirect('/admin/post');        
    })
    else {
        Post.findOne({_id: req.params.id}).then((post) => {
            Category.find().then((categories) => {
                res.render('post/form', {post: post, categories: categories, formState: formState});
            }).catch((error)=>{
                req.flash('error_message', 'Houve um erro ao listar as categorias');
                res.redirect('/admin/post');        
            });
        }).catch((error)=>{
            req.flash('error_message', 'Postagem não encontrada');
            res.redirect('/admin/post');        
        });
    }
}

function createOrUpdate(req, res, formState) {
    const errors = [];

    const post = new Post({
        title: req.body.title,
        text: req.body.text,
        category: req.body.category,
        urlSlug: req.body.urlSlug
    });

    if (!post.title || typeof post.title  == undefined || post.title == null || post.title == '')
        errors.push({text: 'Título não informado'})
    
    if (req.body.title.length < 3) 
        errors.push({text: 'Título deve ser maior ou igual à 3 caracteres'})

    if (!post.urlSlug || typeof post.urlSlug == undefined || post.urlSlug == null || post.urlSlug == '')
        errors.push({text: 'URL Slug não informado'})
    
    if (post.urlSlug.length < 3) 
        errors.push({text: 'URL Slug deve ser maior ou igual à 3 caracteres'})

    if (!post.category || typeof post.category  == undefined || post.category == null || post.category == '--')
        errors.push({text: 'Categoria não informada'})

    if (errors.length > 0) {

        Category.find().then((categories) => {
            res.render('post/form', {categories: categories, errors: errors, formState: req.body.formState, post: post});
        }).catch((error) => {
            req.flash('error_message', 'Ocorreu um erro selecionar a lista de categorias. Tente novamente. (erro: ' + error.message + ')');
            res.redirect('/admin/post');        
        })        
    } 
    else {
        if (req.body.formState == consts.formState.create) {
            post.save().then(() => {
                req.flash('success_message', 'Postagem salva  com sucesso');
                res.redirect('/admin/post');
            }).catch((error) => {
                req.flash('error_message', 'Ocorreu um erro ao salvar a postagem. Tente novamente. (erro: ' + error.message + ')');
                res.redirect('/admin/post');
            });
        }
        else {
            Post.findOne({_id:req.body.id}).then((updatingPost) => {
                updatingPost.title = post.title;
                updatingPost.text = post.text;
                updatingPost.category = post.category;
                updatingPost.urlSlug = post.urlSlug;
                updatingPost.updatedAt = Date.now();
    
                updatingPost.save().then(() => {
                    req.flash('success_message', 'Postagem editada com sucesso');
                    res.redirect('/admin/post');
                }).catch((error) => {
                    req.flash('error_message', 'Ocorreu um erro ao salvar a postagem. Tente novamente. (erro: ' + error.message + ')');
                    res.redirect('/admin/post');
                });
            }).catch((error) => {
                req.flash('error_message', 'Ocorreu um erro ao salvar a postagem. Tente novamente. (erro: ' + error.message + ')');
                res.redirect('/admin/post');
            });
        }
    }
}

function remove(req, res) {
    console.log(req.body.id);
    Post.remove({_id: req.body.id}).then(() => {
        req.flash('success_message', 'Postagem removida com sucesso');
        res.redirect('/admin/post');
    }).catch((error) => {
        req.flash('error_message', 'Ocorreu um erro ao remover a postagem. Tente novamente. (erro: ' + error.message + ')');
        res.redirect('/admin/post');
    });
};

function homePosts(req, res) {
    Post.find().populate('category').sort({createdAt: 'desc'}).then(function(posts) {
        for (var i in posts) {
            posts[i].text = posts[i].text.substring(0,100);
        }
        res.render('home', {posts: posts})
    }).catch(function(error) {
        req.flash('error_message', 'Ocorreu um erro ao localizar as postagens. Tente novamente. (erro: ' + error.message + ')');
        res.render('/home')
    });      
}

function getSinglePost(req, res) {
    Post.findOne({urlSlug: req.params.urlSlug}).populate('category').then((post) => {
        if (post)
            res.render("post/read", {post: post})
        else {
            req.flash('error_message', 'Post não foi encontrado.');
            res.redirect("/");            
        }
    }).catch((error) => {
        req.flash('error_message', 'Post não foi encontrado. (erro: ' + error.message + ')');
        res.redirect("/");
    });
}

module.exports = {
    list: list,
    form: form,
    createOrUpdate: createOrUpdate,
    remove: remove,
    homePosts: homePosts,
    getSinglePost:getSinglePost
}