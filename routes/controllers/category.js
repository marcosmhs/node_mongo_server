const express = require('express');

// para usar mongoose externamente
const mongoose = require('mongoose');
require('../../models/Category')
require('../../models/Post')
const consts = require('../../consts')
const Category = mongoose.model('categories')
const Post = mongoose.model('posts')


function list(req, res) {
    Category.find().sort({name: 'asc'}).then((categories) => {
        res.render('category/list', {categories: categories})
    }).catch((error) => {
        req.flash('error_message', 'Ocorreu um erro ao localizar as categorias cadastradas. Tente novamente. (erro: ' + error.message + ')');
        res.redirect('/admin/category');
    });    
}

function form(req, res, formState) {
    if (formState == consts.formState.create)
        res.render('category/form', {formState: formState});
    else {
        Category.findOne({_id: req.params.id}).then((category) => {
            res.render('category/form', {category: category, formState: formState});
        }).catch((error)=>{
            req.flash('error_message', 'Categoria não encontrada. ' + error);
            res.redirect('/admin/category');        
        });
    }
}

function createOrUpdate(req, res) {
    const category = new Category({
        _id: req.body._id,
        name: req.body.name,
        urlSlug: req.body.urlSlug,
    })
    
    const errors = [];

    if (!category.name || typeof category.name  == undefined || category.name == null || category.name == '')
        errors.push({text: 'Nome da categoria não informado'})
    
    if (category.name.length < 3) 
        errors.push({text: 'Nome da categoria deve ser maior ou igual à 3 caracteres'})

    if (!category.urlSlug || typeof category.urlSlug == undefined || category.urlSlug == null || category.urlSlug == '')
        errors.push({text: 'URL Slug não informado'})
    
    if (category.urlSlug.length < 3) 
        errors.push({text: 'URL Slug deve ser maior ou igual à 3 caracteres'})

    if (errors.length > 0) {
        res.render('category/form', {errors: errors, formState: req.body.formState, category: category})
    } 
    else {
        if (req.body.formState == consts.formState.create) {
            category.save().then(() => {
                req.flash('success_message', 'Categoria cadastrada com sucesso');
                res.redirect('/admin/category');
            }).catch((error) => {
                req.flash('error_message', 'Ocorreu um erro ao salvar a categoria. Tente novamente. (erro: ' + error.message + ')');
                res.redirect('/admin/category');
            });
        }
        else {
            Category.findOne({_id:req.body.id}).then((updatingCategory) => {
                updatingCategory.name = req.body.name;
                updatingCategory.urlSlug = req.body.urlSlug;
                updatingCategory.updatedAt = Date.now();
    
                updatingCategory.save().then(() => {
                    req.flash('success_message', 'Categoria editada com sucesso');
                    res.redirect('/admin/category');
                }).catch((error) => {
                    req.flash('error_message', 'Ocorreu um erro ao atualizar a categoria. Tente novamente. (erro: ' + error.message + ')');
                    res.redirect('/admin/category');
                });
            }).catch((error) => {
                req.flash('error_message', 'Ocorreu um erro ao atualizar a categoria. Tente novamente. (erro: ' + error.message + ')');
                res.redirect('/admin/category');
            });
        }
    }
}

function remove(req, res) {
    console.log(req.body.id);
    Post.findOne({category: req.body.id}).then((post) => {
        if (post != null) {
            req.flash('error_message', 'Esta categoria possui um ou mais postagens associadas à ela, edite as postagens ou apague-as antes.');
            res.redirect('/admin/category');
        }
        else {
            Category.remove({_id: req.body.id}).then(() => {
                req.flash('success_message', 'Categoria removida com sucesso');
                res.redirect('/admin/category');
            }).catch((error) => {
                req.flash('error_message', 'Ocorreu um erro ao remover a categoria. Tente novamente. (erro: ' + error.message + ')');
                res.redirect('/admin/category');
            });            
        } 
    }).catch((error) => {
        req.flash('error_message', 'Ocorreu um erro ao remover a categoria. Tente novamente. (erro: ' + error.message + ')');
        res.redirect('/admin/category');
    });
};

module.exports = {
    list: list,
    form: form,
    createOrUpdate: createOrUpdate,
    remove: remove
}