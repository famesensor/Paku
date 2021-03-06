const express = require('express');
const router = express.Router();
const passport = require('passport');

// Import Models 
const User = require('../../models/user');
const Post = require('../../models/post');

// import input validation
const validateEditProfile = require('../../validator/edit');
const validateImageURL = require('../../validator/image');

// @route       GET api/profile/test
// @desc        Default Route
// @access      Public
router.get('/test', (req, res) => res.json({ msg : 'Tests profile system' }));

// @route   GET api/profile/
// @desc    Get current users 
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // let errors = {}; 
    User.findById(req.user.id) 
        .then((profile) => {
            res.json(profile)
        })
        .catch((err) => {
            res.status(404).json({ profile: 'User not found'});
        });
});

// @route   GET api/profile/alluser
// @desc    Get All users 
// @access  Public
router.get('/alluser', (req, res) => {
    User.find({ status: 0 }).sort({ created: -1 })
        .then((profile) => {
            if (profile.length === 0) {
                return res.status(200).json({ msg : 'User not found' });
            }
            res.json(profile);
        })
        .catch((err) => {
            res.sendStatus(500)
        })
});

// @route   POST api/profile/edit
// @desc    post edit users profile
// @access  Private
router.post('/edit', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEditProfile(req.body);
    
    // Check Validation
    if (!isValid) {
        // console.log(errors);
        return res.status(400).json(errors);
    }

    User.findById(req.user.id) 
        .then((userData) => { 
            userData.phone = req.body.phone;
            userData.aboutMe = req.body.about;
            
            userData.save().then((user) => {
                res.json(user);
            })
        })
        .catch((err) => {
            res.status(404).json({ error: 'No Post found with that ID'});
        });
})

// @route   DELETE api/profile/delete
// @desc    Get current users profile
// @access  Private
router.delete('/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findOneAndRemove({ user: req.user.id}).then(
        User.findByIdAndDelete({ _id: req.user.id }).then(
            res.json({ success: true })
        )
        .catch((err) => {
            res.status(404).json({ profile: 'No User found with that ID'})
        })
    )
});

// @route   GET api/profile/handle/:id
// @desc    Get the profile data of the params passed
// @access  Private
router.get('/handle/:id', (req, res) => {
    let errors = {};

    User.findOne({ username: req.parms.id }).select({ state: 0, terms: 0, Card: 0})
        .then((profile) => {
            if (!profile) {
                errors.msg = 'User not found';
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch((err) => {
            res.state(404).json({ profile: 'No User found with that ID'});
        });
});

// @route   POST api/profile/upload
// @desc    Post Picture user 
// @access  Private
router.post('/upload', passport.authenticate('jwt', { session: false }), (req, res ) => {
    const { errors, isValid } = validateImageURL(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    
    User.findById(req.user.id)
        .then((newImage) => {
            newImage.photo_user = req.body.imageURL

            newImage.save()
                .then((user) => {
                    res.json(user)
                })
                .catch((err) => {
                    res.status(400).json({ image : "Upload fail" })
                })
        })
        .catch((err) => {
            res.state(404).json({image: 'No User found with that ID'});
        })
});

module.exports = router;