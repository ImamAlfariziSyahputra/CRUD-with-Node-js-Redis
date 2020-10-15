const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const redis = require('redis')

// Redis Client
let client = redis.createClient()

client.on('connect', function(){
    console.log('Connected to Redis')
})

const port = 3000

const app = express()

app.engine('handlebars', exphbs({defaultLayout:'main'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.use(methodOverride('_method'))

app.get('/', function(req, res, next){
    res.render('searchusers')
})

// Search
app.post('/user/search', function(req, res, next){
    let {id} = req.body

    client.hgetall(id, function(err, obj){
        if(!obj){
            res.render('searchusers', {
                error: `User does not exist`
            })
        }else {
            obj.id = id
            res.render('details', {
                user: obj
            })
        }
    })
})

// Create
app.get('/user/add', function(req,res,next){
    res.render('adduser')
})

// Add
app.post('/user/add', function(req,res,next){
    let {id} = req.body
    let {first_name} = req.body
    let {last_name} = req.body
    let {email} = req.body
    let {phone} = req.body

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
    ], function(err, reply){
        if(err) {
            console.log(err)
        }
        console.log(reply)
        res.redirect('/')
    })
})

// edit
app.get('/user/edit/:id', function(req,res,next){
    let {id} = req.params

    client.hgetall(id, function(err, obj){
        obj.id = id
        res.render('updateuser', {
            user: obj
        })
    })
})

// Update
app.put('/user/update', function(req, res, next){
    let {id} = req.body
    let {first_name} = req.body
    let {last_name} = req.body
    let {email} = req.body
    let {phone} = req.body

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
    ], function(err, reply){
        if(err) {
            console.log(err)
        }
        console.log(reply)
        res.redirect('/')
    })
})

// Delete
app.delete('/user/delete/:id', function(req,res,next) {
    client.del(req.params.id)
    res.redirect('/')
})

app.listen(port, function(){
    console.log('Server started on port ' + port)
})