const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getGenres } = require('../controllers/moviesController');

// GET all movies with optional search/filter
router.get('/', getMovies);

// GET movie by ID
router.get('/:movieId', getMovieById);

// GET all genres
router.get('/genres/list', getGenres);

module.exports = router;
