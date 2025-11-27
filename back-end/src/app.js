import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config() // Carrega as variáveis de ambiente do arquivo .env

import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

const app = express()

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}))

/*
Vulnerabilidade: API8:2023 – Má configuração de segurança
Observação: Indícios de configuração insegura/duplicada de CORS e ordem de middlewares.
- Onde: back-end/src/app.js
- O que foi observado: duas chamadas app.use(cors(...)) presentes; credenciais habilitadas e origem carregada de env sem validação adicional.
- Ação recomendada: consolidar configuração de CORS, validar ALLOWED_ORIGINS em startup, e garantir secure/httpOnly em cookies (ver users.login).
*/


/*
Vulnerabilidade: API2:2023 – Falha de autenticação
Observação: Autenticação por JWT existe (back-end/src/middleware/auth.js) mas está parcialmente falha.
- Onde: back-end/src/middleware/auth.js e back-end/src/app.js
- Por que deveria ser evitada: auth.js depende de req.cookies e do parsing do body, porém em app.js o auth é aplicado antes de cookieParser() e json(), o que pode quebrar/contornar a verificação. Além disso o middleware original atribui token sem declaração (vazamento global) e faz comparação com req.url (inclui query) em vez de req.path.
- Ação recomendada: mover cookieParser()/json() antes do auth, declarar variáveis localmente, usar req.path para bypass e validar token com try/catch.
*/

// Middleware de verificação do token de autorização
import auth from './middleware/auth.js'
app.use(auth)

/*
Vulnerabilidade: API4:2023 – Consumo irrestrito de recursos
Observação: Mitigado parcialmente pelo uso de rate limiter.
- Onde: back-end/src/app.js
- O que foi feito: express-rate-limit configurado (limit 20 por minuto), o que reduz risco de abuso e DoS simples.
- Nota: revisar limites por rota/usuário e aplicar proteção adicional (circuit breaker, limites por endpoint sensível).
*/

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

// Rate limiter: limita a quantidade de requisições que cada usuário/IP
// pode efetuar dentro de um determinado intervalo de tempo
import { rateLimit } from 'express-rate-limit'


const limiter = rateLimit({
 windowMs: 60 * 1000,    // Intervalo: 1 minuto
 limit: 20               // Máximo de 20 requisições
})


app.use(limiter)


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
