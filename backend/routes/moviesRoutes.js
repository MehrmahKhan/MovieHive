const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getGenres, addMovie } = require('../controllers/moviesController');

// GET all movies with optional search/filter
router.get('/', getMovies);

// GET movie by ID
router.get('/:movieId', getMovieById);

// GET all genres
router.get('/genres/list', getGenres);

// POST - Add new movie (admin only)
router.post('/', addMovie);

module.exports = router;
