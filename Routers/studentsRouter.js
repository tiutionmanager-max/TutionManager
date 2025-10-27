import express from 'express';
import { addStudent, deleteStudent, getStudents, searchStudents, updateStudent } from '../Controllers/studentController.js';
import { allowRoles } from '../Middleware/roleMiddleware.js';
import { protect } from '../Middleware/authMiddleware.js';

const studentsRouter = express.Router();


studentsRouter.post('/add-students',protect,allowRoles('tutor','tutor-center'),addStudent)
studentsRouter.get('/get-students',protect,allowRoles('tutor','tutor-center','SuperAdmin'),getStudents)
studentsRouter.delete('/delete-student/:id',protect,allowRoles('tutor','tutor-center'),deleteStudent)
studentsRouter.put('/update-student/:id',protect,allowRoles('tutor','tutor-center'),updateStudent)
studentsRouter.get('/search',protect,allowRoles('tutor','tutor-center'),searchStudents)
export default studentsRouter;