const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({"user" : req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if (favorites.length>0) {
            res.json(favorites[0]);
        } else {
            res.json({});
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log("Load the favorites for user "+req.user._id);
    Favorites.find({"user" : req.user._id})
    .then((favorites) => {
        console.log("favorites: "+favorites);
        if (favorites == null || favorites.length == 0) {
            // create favorite
            Favorites.create(
                    {
                        "user" : req.user._id,
                        "dishes" : req.body
                    }
            )
            .then((favorite) => {
                console.log('Favorite Created '+ favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
                    
        } else {
            let favorite = favorites[0];
            console.log('favorite in else '+ favorite);
            //add dish if it is not present in the current list
            for (var i = 0; i < req.body.length; i++) {
                var found = false;
                console.log('req.body[i]._id: ', req.body[i]._id);
                for (var j = 0; j < favorite.dishes.length; j++) {
                    console.log('favorite.dishes[j]._id: ', favorite.dishes[j]._id);
                    if (req.body[i]._id == favorite.dishes[j]._id) {
                        found = true;
                        console.log('found');
                        break;
                    }
                }
                if (found === false) {
                    console.log('add to dishes array: '+req.body[i]._id);
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            favorite.save()
            .then((favorite) => {
                console.log('favorite is saved');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
            console.log('fim');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    console.log("Delete the favorites for user "+req.user._id);
    Favorites.remove({"user" : req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+req.params.dishId);
}).post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var dishId = req.params.dishId;
    console.log('dishId: ' + dishId);
    console.log("Load the favorites for user "+req.user._id);
    Favorites.find({"user" : req.user._id})
    .then((favorites) => {
        console.log("favorites: "+favorites);
        if (favorites == null || favorites.length == 0) {
            // create favorite
            Favorites.create(
                    {
                        "user" : req.user._id,
                        "dishes" : [dishId]
                    }
            )
            .then((favorite) => {
                console.log('Favorite Created '+ favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
                    
        } else {
            let favorite = favorites[0];
            console.log('favorite in else '+ favorite);
            //add dish if it is not present in the current list
            var found = false;
            for (var j = 0; j < favorite.dishes.length; j++) {
                console.log('favorite.dishes[j]._id: ', favorite.dishes[j]._id);
                if (dishId == favorite.dishes[j]._id) {
                    found = true;
                    console.log('found');
                    break;
                }
            }
            if (found === false) {
                console.log('add to dishes array: '+dishId);
                favorite.dishes.push(dishId);
            }
            favorite.save()
            .then((favorite) => {
                console.log('favorite is saved');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
            console.log('fim');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var dishId = req.params.dishId;
    console.log('dishId: ' + dishId);
    console.log("Load the favorites for user "+req.user._id);
    Favorites.find({"user" : req.user._id})
    .then((favorites) => {
        console.log("favorites: "+favorites);
        if (favorites == null || favorites.length == 0) {
                console.log('Nothing to delete');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.json("Nothing to delete");
        } else {
            let favorite = favorites[0];
            console.log('favorite in else '+ favorite);
            //add dish if it is not present in the current list
            var indexToBeDeleted = -1;
            for (var j = 0; j < favorite.dishes.length; j++) {
                console.log('favorite.dishes[j]._id: ', favorite.dishes[j]._id);
                if (dishId == favorite.dishes[j]._id) {
                    indexToBeDeleted = j;
                    console.log('found');
                    break;
                }
            }
            if (indexToBeDeleted >= 0) {
                console.log('remove the index: '+j);
                favorite.dishes.splice(j,1);
            }
            console.log('new array: '+favorite.dishes);
            favorite.save()
            .then((deleted) => {
                console.log('favorite is saved');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
            console.log('fim');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;