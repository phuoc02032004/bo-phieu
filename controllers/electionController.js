const ElectionService = require("../services/electionService");

const createElection = async (req, res) => {
  try {
    const election = await ElectionService.createElection(req.body);
    res.status(201).json({ message: "Election created", election });
  } catch (error) {
    res.status(500).json({ message: "Error creating election", error: error.message });
  }
};

const getAllElections = async (req, res) => {
  try {
    const elections = await ElectionService.getAllElections();
    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ message: "Error getting elections", error: error.message });
  }
};

const getElectionById = async (req, res) => {
  try {
    const election = await ElectionService.getElectionById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: "Error getting election", error: error.message });
  }
};

const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const voterId = req.user._id; // Giả sử middleware đã thêm req.user

    const result = await ElectionService.castVote({ electionId, candidateId, voterId });
    res.json({ message: "Vote cast", result });
  } catch (error) {
    res.status(500).json({ message: "Error casting vote", error: error.message });
  }
};


module.exports = { createElection, getAllElections, getElectionById, castVote };