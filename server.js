import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './Routers/Routers.js';
import studentsRouter from './Routers/studentsRouter.js';
import superAdminRouter from "./Routers/superAdminRoutes.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const connectDB = async ()=> {
    try {

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);

        
    }
}

app.use('/api/users', userRouter);
app.use('/api/students', studentsRouter);
app.use("/api/superadmin", superAdminRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();




