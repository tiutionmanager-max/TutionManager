import User from "../Models/user.js";
import Student from "../Models/students.js";
import jwt from "jsonwebtoken";


// 🧩 Get all users (tutors + tutor-centers)
export const getAllUsers = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin || admin.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ role: { $in: ["tutor", "tutor-center"] } }).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🧠 Get all students across system
export const getAllStudents = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin || admin.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await Student.find().populate("tutorId centerId", "name email role");
    res.status(200).json(students);
  } catch (error) {
    console.error("Get all students error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ❌ Delete any user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin || admin.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
