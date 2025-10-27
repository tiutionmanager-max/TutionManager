import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import User from '../Models/user.js';
import { sendEmail } from '../Utils/sendEmail.js';

export const signUp = async (req,res) => {

    try {

        const {name,email,password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});

        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({name,email,password: hashedPassword});

        const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role }, 
        process.env.JWT_SECRET, // 🔐 Make sure this exists in your .env
        { expiresIn: "7d" } // token valid for 7 days

        );

        res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token,
        });

        
    } catch (error) {

        console.error("Register Error:", err.message); // ✅ log to console
    res.status(500).json({ message: "Server error", error: err.message })
        
    }

}

export const login = async (req,res)=>{

    try {
        
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "Please provide email and password"});
        }

        if(email && password){
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({message: "User not found"});
            }
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if(!isPasswordCorrect){
                return res.status(400).json({message: "Invalid credentials"});
            }
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role }, 
                process.env.JWT_SECRET, // 🔐 Make sure this exists in your .env
                { expiresIn: "7d" } // token valid for 7 days
                );
            res.status(200).json({
                token,
                user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                
                });
        }

    } catch (error) {
                console.error("Login Error:", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
    }

}

export const reqestOTP = async(req,res)=>{
    try {

        const {email,OTP} = req.body;
        if (!email){
            return res.status(400).json({message: "Please provide email"});
        }
        const existingUser = await User.findOne({email});
        if (!existingUser){
            return res.status(400).json({message: "Please Re-Check your Email Address"});
        }

        const sendOTP = Math.floor(100000 + Math.random() * 900000);

        existingUser.OTP = sendOTP;
        existingUser.OTP_expiry = Date.now() + 10 * 60 * 1000; 
        await existingUser.save();

        await sendEmail(
            existingUser.email,
            "Your OTP Code",
            `Your OTP code is ${sendOTP}. It is valid for 10 minutes.`
        );
        res.status(200).json({message: "OTP sent to your email"});

    } catch (error) {

        console.error("Request OTP Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });

    }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, OTP, newPassword } = req.body;

    if (!email || !OTP || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and newPassword are required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Please Re-Check your Email Address" });
    }

    // Verify OTP
    if (OTP != existingUser.OTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > existingUser.OTP_expiry) {
      return res.status(400).json({ message: "OTP Expired" });
    }

    // Hash & Save New Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    existingUser.password = hashedPassword;
    existingUser.OTP = null; // clear OTP
    existingUser.OTP_expiry = null;
    await existingUser.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

