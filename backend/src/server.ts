import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import learningRoutes from './routes/learningRoutes';

dotenv.config();


connectDB();

const app = express();

app.use(express.json());
app.use(cors());       
app.use(helmet());      
app.use(morgan('dev'));  

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/learn', learningRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in development mode`);
});