const express = require('express');
const router3 = express.Router();
const Teacher = require("../../models/teacher");
const authMiddleware = require('../../middleware/validation');
const axios = require('axios')



//####################################################################################### teacher Registeration #####################################################################################################################################################################################
router3.post('/addTeacher',async (req, res) => {
    const {teacher_id,role,teacher_name,teacher_address,teacher_dob,teacher_number,teacher_parentsnumber,teacher_mothername,teacher_fathername,teacher_category,teacher_gender,teacher_photo,teacher_mail} = req.body;
    
    try {
        const newTeacher = new Teacher({
            teacher_id,role,teacher_name,teacher_number,teacher_gender,teacher_photo,teacher_mail
        });

        // Save the new teacher to the database
        const savedTeacher = await newTeacher.save();

        res.status(201).json(savedTeacher._id);
        await axios.post('https://logging-services.onrender.com/log', { level: 'info', message: `New Teacher has been added` });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add teacher" });
    }
});







//####################################################################################### Get teacher  #####################################################################################################################################################################################
router3.get('/getAllTeachers',authMiddleware(['Admin']) , async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get teachers" });
    }
});






//####################################################################################### Get teacher by ID  #####################################################################################################################################################################################
router3.get('/getTeacher/:teacherId', authMiddleware(['Admin', 'Teacher']), async (req, res) => {
    const teacherId = req.params.teacherId;
    
    try {
        const teacher = await Teacher.findOne({ teacher_id: teacherId });

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get teacher" });
    }
});








//####################################################################################### Update teacher by ID  #####################################################################################################################################################################################
router3.put('/updateTeacher/:id', authMiddleware(['Admin']) ,async (req, res) => {
    const teacherId = req.params.id;
    const updateData = req.body;

    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, updateData, { new: true });

        if (!updatedTeacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.json(updatedTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update teacher" });
    }
});







//####################################################################################### Delete teacher by ID  #####################################################################################################################################################################################
router3.delete('/deleteTeacher/:id',authMiddleware(['Admin']) , async (req, res) => {
    const teacherId = req.params.id;

    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

        if (!deletedTeacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.json({ message: "Teacher deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete teacher" });
    }
});








//####################################################################################### Delete teacher  #####################################################################################################################################################################################
router3.delete('/deleteAllTeachers', authMiddleware(['Admin']) , async (req, res) => {
    try {
        await Teacher.deleteMany({});
        res.json({ message: "All teachers deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete all teachers" });
    }
});

module.exports = router3;