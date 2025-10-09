import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config() // Carrega as variáveis de ambiente do arquivo .env

import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

const app = express()

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  // credentials: true
}))

// Middleware de verificação do token de autorização
import auth from './middleware/auth.js'
app.use(auth)


app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  
}))

/*********** ROTAS DA API **************/

import carsRouter from './routes/cars.js'
app.use('/cars', carsRouter)

import customersRouter from './routes/customers.js'
app.use('/customers', customersRouter)

import usersRouter from './routes/users.js'
app.use('/users', usersRouter)

export default app
