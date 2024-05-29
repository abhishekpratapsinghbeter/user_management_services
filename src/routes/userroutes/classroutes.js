const express = require('express');
const router1 = express.Router();
const authMiddleware = require("../../middleware/validation");
const Class = require("../../models/class");
const Teacher = require('../../models/teacher');
const Subject = require('../../models/subject');
const axios = require('axios')




//####################################################################################### Class Registeration #####################################################################################################################################################################################
router1.post('/addClass', authMiddleware(['Admin']), async (req, res) => {
    try {
        const { class_batch, class_course, class_section, class_branch, class_facilitator, subjectNames, subjectTeachers } = req.body;
        
        if (!class_batch || !class_course || !class_section || !class_branch || !class_facilitator || !subjectNames || !subjectTeachers || subjectNames.length !== subjectTeachers.length) {
            return res.status(422).json({ error: "Missing required fields or invalid subjects array" });
        }

        // Find the teacher ID for the class facilitator
        const ci = await Teacher.findOne({ teacher_name: class_facilitator });
        if (!ci) {
            return res.status(404).json({ error: "Class facilitator not found" });
        }
        console.log('Class facilitator found:', ci);

        const subjects = [];
        for (let i = 0; i < subjectNames.length; i++) {
            const subjectName = subjectNames[i];
            const subjectTeacher = subjectTeachers[i];

            const subject = await Subject.findOne({ subject_name: subjectName });
            const teacher = await Teacher.findOne({ teacher_name: subjectTeacher });

            if (!subject || !teacher) {
                return res.status(404).json({ error: `Subject or teacher not found for pair ${i + 1}` });
            }

            subjects.push({
                subject_name: subject._id,
                subject_teacher: teacher._id
            });
        }

        const newClass = await Class.create({
            class_batch,
            class_course,
            class_section,
            class_branch,
            class_facilitator: ci._id,
            subject: subjects
        });


        res.status(201).json(newClass);

        await axios.post('https://logging-services.onrender.com/log', { level: 'info', message: `New class has been added` });
        
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ error: "Failed to add class" });
    }
});
;







//####################################################################################### Get Class  #####################################################################################################################################################################################
router1.get('/getClasses', authMiddleware(['Admin', 'Teacher']), async (req, res) => {
    try {
        // Retrieve all classes from the database and populate the subject and subject_teacher fields
        const classes = await Class.find()
            .populate('subject.subject_name')
            .populate('subject.subject_teacher').populate('class_facilitator');

        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve classes" });
    }
});






//####################################################################################### Get Class by ID  #####################################################################################################################################################################################
router1.get('/getClassById/:id',authMiddleware(['Admin','Teacher']), async (req, res) => {
    const classId = req.params.id;
    
    try {
        // Retrieve the class by its ID from the database
        const foundClass = await Class.findById(classId);
        if (!foundClass) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json(foundClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve class" });
    }
});







//####################################################################################### Get Class by section  #####################################################################################################################################################################################
router1.get('/getBySection/:section',authMiddleware(['Admin','Teacher']), async (req, res) => {
    const section = req.params.section;

    try {
        // Find classes by section in the database
        const classes = await Class.find({ class_section: section });

        if (!classes || classes.length === 0) {
            return res.status(404).json({ error: "Classes not found for the provided section" });
        }

        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch classes by section" });
    }
});







//####################################################################################### Get Class by Batch  #####################################################################################################################################################################################
router1.get('/getByBatch/:batch',authMiddleware(['Admin','Teacher']), async (req, res) => {
    const batch = req.params.batch;

    try {
        // Find classes by batch in the database
        const classes = await Class.find({ class_batch: batch });

        if (classes.length === 0) {
            return res.status(404).json({ error: "No classes found for the provided batch" });
        }

        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve classes by batch" });
    }
});






//####################################################################################### Update Class by Section  #####################################################################################################################################################################################
router1.put('/updateBySection/:section',authMiddleware(['Admin']), async (req, res) => {
    const section = req.params.section;
    const updateData = req.body;

    try {
        // Update classes by section in the database
        const result = await Class.updateMany({ class_section: section }, { $set: updateData });

        if (result.nModified === 0) {
            return res.status(404).json({ error: "No classes found for the provided section" });
        }

        res.status(200).json({ message: "Classes updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update classes by section" });
    }
});










//####################################################################################### Update Class by Batch  #####################################################################################################################################################################################
router1.put('/updateByBatch/:batch', authMiddleware(['Admin']), async (req, res) => {
    const batch = req.params.batch;
    const updateData = req.body;

    try {
        // Update classes by batch in the database
        const result = await Class.updateMany({ class_batch: batch }, { $set: updateData });

        if (result.nModified === 0) {
            return res.status(404).json({ error: "No classes found for the provided batch" });
        }

        res.status(200).json({ message: "Classes updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update classes by batch" });
    }
});





//####################################################################################### Update Class by ID  #####################################################################################################################################################################################
router1.put('/updateClassById/:id', authMiddleware(['Admin']), async (req, res) => {
    const classId = req.params.id;
    const updateFields = req.body;

    try {
        // Fetch subject and teacher IDs based on names
        const updatedSubjects = await Promise.all(updateFields.subject.map(async (subject) => {
            try {
                // Fetch subject ID
                const subjectDoc = await Subject.findOne({ subject_name: subject.subject_name });
                if (!subjectDoc) {
                    throw new Error(`Subject "${subject.subject_name}" not found`);
                }
                const subjectId = subjectDoc._id;

                // Fetch teacher ID
                const teacherId = await Teacher.findOne({ teacher_name: subject.subject_teacher });
                if (!teacherId) {
                    throw new Error(`Teacher "${subject.subject_teacher}" not found`);
                }
                const teacher = teacherId._id;

                return {
                    subject_name: subjectId,
                    subject_teacher: teacher,
                };
            } catch (error) {
                console.error("Error fetching subject or teacher ID:", error.message);
                return null;
            }
        }));

        // Update updateFields with subject and teacher IDs
        const updatedFields = {
            ...updateFields,
            subject: updatedSubjects,
        };

        // Update the class by its ID in the database
        const updatedClass = await Class.findByIdAndUpdate(classId, updatedFields, { new: true });

        if (!updatedClass) {
            return res.status(404).json({ error: "Class not found" });
        }
        res.status(200).json(updatedClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update class" });
    }
});









//####################################################################################### Delete Class by ID  #####################################################################################################################################################################################
router1.delete('/deleteClassById/:id',authMiddleware(['Admin']), async (req, res) => {
    const classId = req.params.id;

    try {
        // Delete the class by its ID from the database
        const deletedClass = await Class.findByIdAndDelete(classId);

        if (!deletedClass) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete class" });
    }
});








//####################################################################################### Delete Class  #####################################################################################################################################################################################
router1.delete('/deleteAllClasses', authMiddleware(['Admin']),async (req, res) => {
    try {
        // Delete all classes from the database
        await Class.deleteMany({});

        res.status(200).json({ message: "All classes deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete all classes" });
    }
});

module.exports = router1;
