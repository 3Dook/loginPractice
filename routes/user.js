const express = require('express')
const router = express.Router();
const passport = require('passport')
const User = require('../models/user');
const { isLoggedIn } = require('../middleware');

router.route('/register')
    .get((req, res)=>{
        res.render('register')
    })
    .post(async (req,res, next)=>{
        console.log('Herllo')
        try{
            //console.log(req.body)
            const { email, username, password } = req.body
            const user = new User({email, username});
            const registerUser = await User.register(user, password);
            req.login(registerUser, err => {
                if (err){
                    return next(err);
                }
                req.flash('success', `WELCOME ${username}`)
                res.redirect(200, 'home', {message: "Success"})
            })
        } catch(e){
            req.flash('error', e.message);
            res.redirect(400, '/user/register')
        }
    })

router.route('/login')
    .get((req, res)=>{
        res.render('login')
    })
    .post(
        passport.authenticate('local', {failureFlash: true, failureRedirect: '/user/login'}), (req, res)=>{
            req.flash('success', "Welcome back!");
            const redirectUrl = req.session.returnTo || '/home';
            delete req.session.returnTo;
            res.redirect(redirectUrl);
    })

router.route('/account')
    .get(isLoggedIn, (req, res)=>{
        res.status(200).render("account")
    })
    .delete(isLoggedIn, async (req, res)=>{
        id = req.user["_id"]
        await User.findByIdAndDelete(id)
            .then(data =>{
                req.logout();
                req.flash('success', "User deleted, returned to home")
                res.status(404).redirect("home")
            })
            .catch(err =>{
                req.flash('error', "Unable to delete user")
                res.status(404).redirect("account")
            })
    })

router.route('/logout')
    .get(isLoggedIn, (req, res)=>{
        res.render('logout')
    })
    .post(isLoggedIn, (req, res)=>{
        req.logout();
        req.flash('success', "Successfully signed out")
        res.redirect("home")
    })



module.exports = router;