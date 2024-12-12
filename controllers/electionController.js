const ElectionService = require("../services/electionService");

const createElection = async (req, res) => {
  try {
    const election = await ElectionService.createElection(req.body);
    res.status(201).json({ message: "Election created", election });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating election", error: error.message });
  }
};

const getAllElections = async (req, res) => {
  try {
    const elections = await ElectionService.getAllElections();
    res.status(200).json(elections);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting elections", error: error.message });
  }
};

const getElectionById = async (req, res) => {
  try {
    const election = await ElectionService.getElectionById(req.params.id);
    if (!election)
      return res.status(404).json({ message: "Election not found" });
    res.json(election);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting election", error: error.message });
  }
};

const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const voterId = req.user._id;

    const result = await ElectionService.castVote({
      electionId,
      candidateId,
      voterId,
    });
    res.json({ message: "Vote cast", result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error casting vote", error: error.message });
  }
};

const addCandidateToElection = async (req, res) => {
  try {
    const electionId = req.params.electionId; // Lấy từ req.params, không phải req.body
    const candidateId = req.body.candidateId;
    const result = await ElectionService.addCandidate(electionId, candidateId);
    res.json({ message: "Ứng viên đã được thêm", election: result });
  } catch (error) {
    console.error("Error in addCandidateToElection:", error); // Log lỗi cụ thể, giúp debug dễ hơn
    res
      .status(500)
      .json({ message: "Lỗi khi thêm ứng viên", error: error.message });
  }
};

const updateCandidate = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const updatedData = req.body;
    const result = await ElectionService.updateCandidate(
      electionId,
      candidateId,
      updatedData
    );
    res.json({ message: "Ứng viên đã được cập nhật", election: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật ứng viên", error: error.message });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    await ElectionService.deleteCandidate(electionId, candidateId);
    res.json({ message: "Ứng viên đã được xóa" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa ứng viên", error: error.message });
  }
};

const joinElection = async (req, res) => {
  try {
    const userId = req.user._id;
    const electionId = req.params.electionId;
    const result = await ElectionService.joinElection(userId, electionId);
    res.json({ message: "Tham gia cuộc bầu cử thành công", user: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tham gia cuộc bầu cử", error: error.message });
  }
};

module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  castVote,
  addCandidateToElection,
  updateCandidate,
  deleteCandidate,
  joinElection,
};
