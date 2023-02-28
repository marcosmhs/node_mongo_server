module.exports = {
    isAdmin: function(req, res, next) {
        console.log(req.isAuthenticated())
        if (req.isAuthenticated() && req.user.admin == true) {
            return next();
        }
        req.flash('error_message', 'Você deve ser administrador para acessar esta área')
        res.redirect('/')
    }
}