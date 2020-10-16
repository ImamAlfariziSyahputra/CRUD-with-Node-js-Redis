const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')

// Redis Client
let client = redis.createClient()

client.on('connect', function(){
    console.log('Connected to Redis')
})

const port = 3000

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.get('/user', function(req, res){
    let return_dataset = []

    client.keys('*', (err, id) => {
        let multi = client.multi()
        let keys = Object.keys(id)
        let i = 0

        keys.forEach( (l) => {
            client.hgetall(id[l], (err, obj) => {
                i++
                if (err) {
                    console.log(err)
                }else {
                    temp_data = {'id':id[l],'data':obj}
                    return_dataset.push(temp_data)
                }

                if (i == keys.length) {
                    res.send({user:return_dataset})
                }
            })
        })
    })
})

// Get By ID
app.get('/user/:id', function(req, res){
    let {id} = req.params

    client.hgetall(id, function(err, obj){
        if(!obj){
            res.send(`User doesn't exist`)
        }else {
            obj.id = id
            res.send({
                user: obj
            })
        }
    })
})

// Add
app.post('/user', function(req,res){
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

        // response = client.hgetall(id)

        res.json(`Add OK`)
    })
})

// Update
app.put('/user/:id', function(req, res){
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
        res.send('Update OK')
    })
})

// Delete
app.delete('/user/:id', function(req,res) {
    client.del(req.params.id)
    res.send('Delete OK')
})

app.listen(port, function(){
    console.log('Server started on port ' + port)
})