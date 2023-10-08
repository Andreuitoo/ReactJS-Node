const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vacantes_react'
})

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.listen(3001, () => {
    console.log('listening on 3001')
})

app.get('/', (req, res)=>{
    res.send({status:200})
})

// endpoints for companies

app.post('/company', (req, res)=>{
    const company = req.body.company
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const logo = req.body.logo

    db.query(`INSERT INTO company (company, username, email, password, logo) VALUES(?,?,?,md5(?),?)`, [company, username, email, password, logo], 
        (err, result)=>{
            if(err){
               res.send({
                    status: 400, 
                    message: err
                })
            }else{
                res.status(201).send({
                    status: 201, 
                    message: 'Empresa creada con éxito',
                    data: result
                })
            }
        }
    )
})

app.post('/login', (req, res)=>{
    const email = req.body.email
    const password = req.body.password

    db.query(`SELECT company_id, company, username, email, logo FROM company WHERE email=? AND password=md5(?)`, [email, password], 
        (err, result)=>{
            if(err){
               res.send({
                    status: 500, 
                    message: err
                })
            }else{
                if (result.length > 0){
                    res.status(200).send(result[0])
                }else{
                    res.status(401).send({
                        status: 401, 
                        message: 'Usuario o contraseña incorrectos',
                    })
                }
            }
        }
    )
})

app.get('/company/:id', (req, res)=>{
    const companyId = req.params.id

    db.query(`SELECT company, username, email, logo FROM company WHERE company_id=${companyId} `, 
        (err, result)=>{
            if (result.length > 0){
                res.status(200).send(result[0])
            }else{
                res.status(400).send({
                    message: 'No existe la empresa',
                })
            }
        }
    )
})

// endpoints for vacantes

app.get('/job/:id', (req, res)=>{
    const id = req.params.id

    db.query(`SELECT * FROM job WHERE job_id=${id} `, 
        (err, result)=>{
            if (result.length > 0){
                res.status(200).send(result[0])
            }else{
                res.status(400).send({
                    message: 'No existe la vacante',
                })
            }
        }
    )
})

app.get('/job/all/:company_id/:page/:limit', (req, res)=>{
    const id = req.params.company_id
    const page = req.params.page
    const limit = req.params.limit

    const start = (page - 1) * limit

    db.query(`SELECT * FROM job WHERE company_id=${id} and deleted=0 order by job_id desc limit ${start}, ${limit} `, 
        (err, result)=>{
            if (result.length > 0){
                res.status(200).send(result)
            }else{
                res.status(400).send({
                    message: 'No tiene vacantes asociados a esta empresa',
                })
            }
        }
    )
})

app.get('/job/all/:page/:limit', (req, res)=>{
    const page = req.params.page
    const limit = req.params.limit
    const start = (page - 1) * limit

    db.query(`SELECT DATEDIFF(J.until_date, (select now())) as dias, J.*, C.company, C.logo FROM job J INNER JOIN company C ON C.company_id = J.company_id where deleted=0 order by job_id desc limit ${start}, ${limit} `, 
        (err, result)=>{
            if (result.length > 0){
                res.status(200).send(result)
            }else{
                res.status(400).send({
                    message: 'No tiene vacantes asociados a esta empresa',
                })
            }
        }
    )
})

app.post('/job', (req, res)=>{
    const title = req.body.title
    const from_date = req.body.from_date
    const until_date = req.body.until_date
    const city = req.body.city
    const job_type = req.body.job_type
    const experience = req.body.experience
    const company_id = req.body.company_id

    db.query(`INSERT INTO job (title, from_date, until_date, city, job_type, experience, company_id) VALUES(?,?,?,?,?,?,?)`, [title, from_date, until_date, city, job_type, experience, company_id], 
        (err, result)=>{
            if(err){
                res.status(400).send({
                    message: err
                })
                
            }else{
                res.status(201).send({
                    status: 201, 
                    message: 'Vacante creada con éxito',
                    data: result
                })
            }
        }
    )
})

app.put('/job/:id', (req, res)=>{
    const id = Number(req.params.id)
    const title = req.body.title
    const from_date = req.body.from_date
    const until_date = req.body.until_date
    const city = req.body.city
    const job_type = req.body.job_type
    const experience = req.body.experience
    const company_id = Number(req.body.company_id)

    db.query(`UPDATE job SET title=?, from_date=?, until_date=?, city=?, job_type=?, experience=? WHERE job_id=? and company_id=?`, [title, from_date, until_date, city, job_type, experience, id, company_id],  
        (err, result)=>{
            if (err){
                res.status(400).send({
                    message: err
                })
            }else{
                res.status(200).send({
                    message: 'Vacante actualizada con éxito',
                    data: result
                })
            }
        }
    )
})

app.delete('/job/:id', (req, res)=>{
    const id = Number(req.params.id)
    const company_id = Number(req.body.company_id)
    console.log(company_id, id)
    console.log(typeof company_id)
    console.log(typeof id)
    console.log(Number(req.body.company_id))

    db.query(`UPDATE job SET deleted=1 where job_id=? and company_id=?`, [id, company_id],  
    (err, result)=>{
        if (err){
            res.status(400).send({
                message: err
            })
        }else{
            res.status(200).send({
                message: 'Vacante borrada con éxito',
                data: result
            })
        }
    }
    )
})

// endpoints for personas

app.post('/persons', (req, res)=>{
    const dni = req.body.dni
    const name = req.body.name
    const email = req.body.email
    const img = req.body.img

    //consultar si existe
    db.query(`SELECT * FROM persons WHERE dni=?`, [dni],
        (err, result) => {
            if (err) {
                res.send({
                    status: 500,
                    message: err
                })
            } else {
                if (result.length > 0) {
                    res.status(200).send(result[0])
                } else {
                    db.query(`INSERT INTO persons (dni, name, email, img) VALUES(?,?,?,?)`, [dni, name, email, img], 
                    (err, result)=>{
                        if(err){
                            res.status(400).send({
                                message: err
                            })
                            
                        }else{
                            res.status(201).send({
                                status: 201, 
                                message: 'Persona creada con éxito',
                                data: result
                            })
                        }
                    }
                )
                }
            }
        }
    )
})

// endpoints for job_apply

app.post('/apply', (req, res)=>{
    const job_id = req.body.job_id
    const persons_id = req.body.persons_id
    const salary = req.body.salary

    db.query(`INSERT INTO job_persons_apply (job_job_id, persons_id, salary) VALUES(?,?,?)`, [job_id, persons_id, salary], 
        (err, result)=>{
            if(err){
                res.status(400).send({
                    message: err
                })
                
            }else{
                res.status(201).send({
                    status: 201, 
                    message: 'Postulación registrada con éxito',
                    data: result
                })
            }
        }
    )
})

app.put('/apply/:job_id/:persons_id', (req, res)=>{
    const job_id = req.params.job_id
    const persons_id = req.params.persons_id
    const deleted = req.body.deleted
    const selected = req.body.selected

    db.query(`UPDATE job_persons_apply SET deleted=?, selected=? where persons_id=? and job_job_id=?`, [deleted, selected, persons_id, job_id], 
        (err, result)=>{
            if(err){
                res.status(400).send({
                    message: err
                })
                
            }else{
                res.status(201).send({
                    status: 201, 
                    message: 'Postulación actualizada con éxito',
                    data: result
                })
            }
        }
    )
})