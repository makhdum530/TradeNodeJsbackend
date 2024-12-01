import express from 'express';
import dotenv from 'dotenv';
import router from './src/routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', router);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});