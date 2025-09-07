import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRouter from './routes/auth.route.js'
import readmeRouter from './routes/readme.route.js'
import { errorHandler } from './middlewares/error.middleware.js'
import cookieParser from 'cookie-parser'

dotenv.config({
    path:'./.env'
})

const app = express();

app.use(cors({origin:process.env.FRONTEND_URL,credentials:true}))
app.use(express.json());
app.use(urlencoded());
app.use(cookieParser())

app.use('/api/v1',authRouter);
app.use('/api/v1',readmeRouter);

app.use(errorHandler);

export default app;