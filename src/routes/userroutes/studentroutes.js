const express = require('express');
const router4 = express.Router();
const Student = require("../../models/student");
const authMiddleware = require('../../middleware/validation');



//####################################################################################### student Registeration #####################################################################################################################################################################################
router4.post('/addstudent',authMiddleware(['Admin']), async (req, res) => {
    const {student_cllgid,student_regId,student_name,student_branch,student_section,student_batch,student_address,student_rollno,student_dob,student_number,student_parentsnumber,student_mothername,student_fathername,student_category,student_gender,student_photo,student_course,semester,student_mail} = req.body;
    const role = "student"
    try {
        // Create a new student instance
        const newstudent = new Student({
            student_cllgid,student_regId,student_name,student_branch,student_section,student_batch,student_address,student_rollno,student_dob,student_number,student_parentsnumber,student_mothername,student_fathername,student_category,student_gender,student_photo,student_course,semester,role,student_mail
        });

        // Save the new student to the database
        const savedstudent = await newstudent.save();

        res.status(201).json(savedstudent._id);
        await axios.post('https://logging-services.onrender.com/log', { level: 'info', message: `New Student has been added` });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add student" });
    }
});







//####################################################################################### Get student  #####################################################################################################################################################################################
router4.get('/getAllstudents',authMiddleware(['Admin','Teacher']), async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get students" });
    }
});






//####################################################################################### Get student by ID  #####################################################################################################################################################################################
router4.get('/getstudent/:id',authMiddleware(['Admin','Teacher','Student']), async (req, res) => {
    const studentId = req.params.id;

    try {
        const student = await Student.findOne({student_cllgid:studentId});

        if (!student) {
            return res.status(404).json({ error: "student not found" });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get student" });
    }
});







//####################################################################################### Update student by ID  #####################################################################################################################################################################################
router4.put('/updatestudent/:id',authMiddleware(['Admin']), async (req, res) => {
    const studentId = req.params.id;
    const updateData = req.body;

    try {
        const updatedstudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true });

        if (!updatedstudent) {
            return res.status(404).json({ error: "student not found" });
        }

        res.json(updatedstudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update student" });
    }
});







//####################################################################################### Delete student   #####################################################################################################################################################################################
router4.delete('/deleteAllstudent', authMiddleware(['Admin']), async (req, res) => {
    try {
        await Student.deleteMany({});
        res.json({ message: "All student deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete all student" });
    }
});








//####################################################################################### Delete student by ID #####################################################################################################################################################################################
router4.delete('/deleteStudent/:id',authMiddleware(['Admin']), async (req, res) => {
    const studentId = req.params.id;

    try {
        const deletedstudent = await Student.findByIdAndDelete(studentId);

        if (!deletedstudent) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "student deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete student" });
    }
});

module.exports = router4;