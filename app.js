import express from 'express';
import dotenv from 'dotenv';
import router from './src/routes/index.js';
import errorHandler from './src/middlewares/errorHandler.js';
import cors from 'cors';

dotenv.config();

const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.use('/', router);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});