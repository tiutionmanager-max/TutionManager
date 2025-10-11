import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({

    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    firstName: { type: String, required: true },
    LastName: { type: String, required: true },
    age: { type: Number },
    grade: { type: String },
    email: { type: String },
    StudentPhone: { type: String },
    GaurdianPhone:{ type: String },
    qrCode: { type: String },
    subjects: [
    {
      name: { type: String, required: true },
      isPaid: { type: Boolean, default: false },
      payments: [
        {
          amount: { type: Number },
          date: { type: Date, default: Date.now },
          method: { type: String }
        }
      ]
    }
  ],
  



})
export default mongoose.model("Student", studentSchema);