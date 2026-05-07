const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');

router.get('/user/:userId', collectionsController.getUserCollections);
router.post('/', collectionsController.createCollection);
router.put('/:collectionId', collectionsController.renameCollection);
router.delete('/:collectionId', collectionsController.deleteCollection);
router.get('/:collectionId/collaborators', collectionsController.getCollectionCollaborators);
router.post('/:collectionId/share', collectionsController.shareCollection);
router.delete('/:collectionId/shares/:shareId', collectionsController.removeCollaborator);

router.get('/:collectionId/movies', collectionsController.getCollectionMovies);
router.post('/:collectionId/movies', collectionsController.addMovieToCollection);
router.delete('/:collectionId/movies/:movieId', collectionsController.removeMovieFromCollection);

module.exports = router;
