const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/AuthMiddleware'); 

router.post('/', authMiddleware, electionController.createElection);
router.get('/', authMiddleware, electionController.getAllElections);
router.get('/:id', authMiddleware, electionController.getElectionById);
router.post('/vote', authMiddleware, electionController.castVote);
router.post('/:electionId/candidates', authMiddleware, electionController.addCandidateToElection);
router.put('/:electionId/candidates/:candidateId', authMiddleware, electionController.updateCandidate); 
router.delete('/:electionId/candidates/:candidateId', authMiddleware, electionController.deleteCandidate); 

router.post('/:electionId/join', authMiddleware, electionController.joinElection);

module.exports = router;