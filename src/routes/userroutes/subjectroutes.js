const express = require('express');
const router2 = express.Router();
const Subject = require("../../models/subject");
const authMiddleware = require('../../middleware/validation');
const axios = require('axios')


//####################################################################################### Subject Registeration #####################################################################################################################################################################################
router2.post('/addSubject', authMiddleware(['Admin']), async (req, res) => {
    const { subject_code, subject_name, subject_semester, subject_department } = req.body;
    // Check if any required fields are missing
    if (!subject_code || !subject_name  || !subject_semester || !subject_department) {
        return res.status(422).json({ error: "Missing required fields or invalid subjects array" });
    }

    try {
        const newSubject = await Subject.create({
            subject_code,
            subject_name,
            subject_semester,
            subject_department,
        });
        res.status(201).json(newSubject);
        await axios.post('https://logging-services.onrender.com/log', { level: 'info', message: `New Subject has been added` });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add Subject" });
    }
});






//####################################################################################### Get Subject  #####################################################################################################################################################################################
router2.get('/getSubjectes',authMiddleware(['Admin','Teacher']), async (req, res) => {
    try {
        // Retrieve all Subjectes from the database
        const Subjectes = await Subject.find();

        res.status(200).json(Subjectes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve Subjectes" });
    }
});






//####################################################################################### Get Subject by ID  #####################################################################################################################################################################################
router2.get('/getSubjectById/:id',authMiddleware(['Admin','Teacher']), async (req, res) => {
    const SubjectId = req.params.id;

    try {
        // Retrieve the Subject by its ID from the database
        const foundSubject = await Subject.findById(SubjectId);

        if (!foundSubject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        res.status(200).json(foundSubject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve Subject" });
    }
});







//####################################################################################### Update Subject by ID  #####################################################################################################################################################################################
router2.put('/updateSubjectById/:id',authMiddleware(['Admin']), async (req, res) => {
    const SubjectId = req.params.id;
    const updateFields = req.body;
    try {
        // Update the Subject by its ID in the database
        const updatedSubject = await Subject.findByIdAndUpdate(SubjectId, updateFields, { new: true });

        if (!updatedSubject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        res.status(200).json(updatedSubject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update Subject" });
    }
});







//####################################################################################### Delete Subject by ID  #####################################################################################################################################################################################
router2.delete('/deleteSubjectById/:id',authMiddleware(['Admin']), async (req, res) => {
    const SubjectId = req.params.id;
    try {
        // Delete the Subject by its ID from the database
        const deletedSubject = await Subject.findByIdAndDelete(SubjectId);

        if (!deletedSubject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete Subject" });
    }
});








//####################################################################################### Delete Subject  #####################################################################################################################################################################################
router2.delete('/deleteAllSubjectes',authMiddleware(['Admin']), async (req, res) => {
    try {
        // Delete all Subject from the database
        await Subject.deleteMany({});

        res.status(200).json({ message: "All Subjectes deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete all Subjectes" });
    }
});


module.exports = router2;