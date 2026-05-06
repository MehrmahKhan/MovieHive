const express = require('express');
const router = express.Router();
const { getMovies, getBrowseMovies, getMovieById, getGenres, addMovie } = require('../controllers/moviesController');

// GET all movies with optional search/filter
router.get('/', getMovies);

// GET browse sections
router.get('/browse/:section', getBrowseMovies);

// GET all genres
router.get('/genres/list', getGenres);

// GET movie by ID
router.get('/:movieId', getMovieById);

// POST - Add new movie (admin only)
router.post('/', addMovie);

module.exports = router;
