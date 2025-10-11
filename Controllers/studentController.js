import qrcode from 'qrcode';
import Student from '../Models/students.js';
import User from '../Models/user.js';
import jwt from "jsonwebtoken";
import students from '../Models/students.js';


export const addStudent = async (req,res)=>{
    try {

        const {firstName,LastName,age,grade,subjects,email,StudentPhone,GaurdianPhone} = req.body

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });

    }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET,{
        expiresIn: "1h", 
        }
            
        );

        const loggedInUser = await User.findById(decoded.id);
        if (!loggedInUser) {
        return res.status(401).json({ message: "Invalid token user" });
    }

        if (!['tutor','tutor-center'].includes(loggedInUser.role)){
            return res.status(403).json({ message: "Forbidden: You don't have permission to add a student." });
        }

        const tutorId = loggedInUser._id;

        const centerId = loggedInUser.organization || (loggedInUser.role === 'tutor-center' ? loggedInUser._id : null);

        const newStudent = new Student({
            tutorId,
            centerId,
            firstName,
            LastName,
            age,
            grade,
            subjects,
            email,
            StudentPhone,
            GaurdianPhone
        })

        const qrData = `StudentID: ${newStudent._id} | Name: ${firstName} ${LastName} | Email: ${email}`;
        const qrImage = await qrcode.toDataURL(qrData)

        newStudent.qrCode = qrImage;
        await newStudent.save();

        res.status(201).json(newStudent)
        
    } catch (error) {
        console.error("Create Student Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
        
        

    }
}

export const getStudents = async (req,res)=> {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET
            ,{
        expiresIn: "1h", 
    }
        );

        const loggedInUser = await User.findById(decoded.id);
        if (!loggedInUser) {
        return res.status(401).json({ message: "Invalid token user" });
    }
        if (!['tutor','tutor-center'].includes(loggedInUser.role)){
            return res.status(403).json({ message: "Forbidden: You don't have permission to view students." });
        }

        let filter = {};
        if (loggedInUser.role==="tutor"){
            filter = {tutorId: loggedInUser._id};

        }else if (loggedInUser.role==="tutor-center"){
            filter = {centerId : loggedInUser._id}
        }

        const students =await Student.find(filter)

        res.status(200).json(students)


        
    } catch (error) {
        
        console.error("Get Students Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteStudent = async (req,res)=>{

    try {

        const {id} = req.params

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET,{
        expiresIn: "1h", 
    });
        const loggedInUser = await User.findById(decoded.id);
        if (!loggedInUser) {
        return res.status(401).json({ message: "Invalid token user" });
        }
        if (!['tutor','tutor-center'].includes(loggedInUser.role)){
            return res.status(403).json({ message: "Forbidden: You don't have permission to delete a student." });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if( loggedInUser.role === 'tutor'&&
            student.tutorId.toString() !== loggedInUser._id.toString()
        ){

            return res.status(403).json({ message: "Forbidden: You can only delete your own students." });

        }
        if(loggedInUser.role === 'tutor-center'&&
            student.centerId?.toString() !== loggedInUser._id.toString()
        ){
            return res.status(403).json({ message: "Forbidden: You can only delete students from your own center." });
        }
        await Student.findByIdAndDelete(id);
        res.status(200).json({ message: "Student deleted successfully" });
      
    } catch (error) {
        
        console.error("Delete Students Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });

    }

}

export const updateStudent = async (req,res)=> {

    try {

        const {id} = req.params

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET,{
        expiresIn: "1h", 
    });
        const loggedInUser = await User.findById(decoded.id);
        if (!loggedInUser) {
        return res.status(401).json({ message: "Invalid token user" });
        }
        if (!['tutor','tutor-center'].includes(loggedInUser.role)){
            return res.status(403).json({ message: "Forbidden: You don't have permission to update a student." });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student){
           if( student.email !== req.body.email ){
            return res.status(400).json({ message: "This is not a Student account you are updating plaease Enter correct one" });
        }
        }
        if( loggedInUser.role === 'tutor'&&
            student.tutorId.toString() !== loggedInUser._id.toString()
        ){

            return res.status(403).json({ message: "Forbidden: You can only update your own students." });

        }
        if(loggedInUser.role === 'tutor-center'&&
            student.centerId?.toString() !== loggedInUser._id.toString()
        ){
            return res.status(403).json({ message: "Forbidden: You can only update students from your own center." });
        }

        await Student.findByIdAndUpdate (id, req.body, {new: true});
        res.status(200).json({ message: "Student updated successfully" });
        
    } catch (error) {
        
        console.error("Update Students Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }

}


export const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;

    // check if query is empty
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Please provide a search query" });
    }

    // 🔐 Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const loggedInUser = await User.findById(decoded.id);
    if (!loggedInUser) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    if (!["tutor", "tutor-center"].includes(loggedInUser.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You don't have permission to search students." });
    }

    
    // 🧠 Build search conditions
    const searchConditions = {
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { LastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { grade: { $regex: query, $options: "i" } },
        { "subjects.name": { $regex: query, $options: "i" } }
      ]
    };

    // 🏫 Restrict based on role
    if (loggedInUser.role === "tutor") {
      searchConditions.tutorId = loggedInUser._id;
    } else if (loggedInUser.role === "tutor-center") {
      searchConditions.centerId =
        loggedInUser._id; // or loggedInUser.organization if applicable
    }

    const students = await Student.find(searchConditions).sort({ firstName: 1 });

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    res.status(200).json({ count: students.length, students });
  } catch (error) {
    console.error("Search Students Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

