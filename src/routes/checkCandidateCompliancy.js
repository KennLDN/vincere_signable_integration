const express = require('express');
const router = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const CandidateCompliancy = require('../models/CandidateCompliancy');

router.use('/check-candidate-compliancy/:id', checkAuthentication);

router.get('/check-candidate-compliancy/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const candidateCompliancy = await CandidateCompliancy.findOne({ candidateId: id });
        if (!candidateCompliancy) {
            return res.status(404).send({ message: "Candidate not found" });
        }
        res.send({ compliant: candidateCompliancy.compliant });
    } catch (error) {
        res.status(500).send({ message: "An error occurred while fetching candidate compliancy", error: error.message });
    }
});

module.exports = router;
