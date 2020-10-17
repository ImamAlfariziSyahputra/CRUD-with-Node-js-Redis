const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')

let client = redis.createClient()

client.on('connect', function(){
    console.log('Connected to Redis')
})

const port = 3000

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

// Get All Data
app.get('/user', function(req, res){
    key = 'user'

    client.get(key, async function(err, obj){
        data = JSON.parse(obj)

        res.send(data)
    })
})

// Get By ID
app.get('/user/:id', function(req, res){
    let {id} = req.params

    client.get('user', function(err, obj){
        // Convert to String
        data = JSON.parse(obj)

        for(var i=0; i<Object.keys(data).length; i++) {
            if (data[i].id == id) {
                res.send(data[i])
            }
            // else{
            //     console.log('User Not Found!')
            // }
        }
    })
})

// Add
app.post('/user', function(req,res){
    let key = 'user'
    let {id} = req.body
    let {name} = req.body
    let {age} = req.body

    let old = []

    client.get(key, async function(err, obj){

        let data = await JSON.parse(obj)
        // console.log(data)

        if(!data) {
            // kalo data lama gak ada jangan jalanin else
        }else {
            // Masukin data lama ke variable old
            old = data
        }

        let newData = {
            'id': id,
            'name': name,
            'age': age,
        }
        
        // Push data baru ke data yang sudah ada
        old.push(newData)

        // Convert Json to String
        let jsonToStr = JSON.stringify(old)

        client.set(key, jsonToStr, function(err, reply){
            if(err) {
                console.log(err)
            }
            console.log(reply)

            res.send(`Add OK`)
        })
    })
})

// Update
app.put('/user/:param', function(req, res){
    let key = 'user'
    let {param} = req.params
    let {id} = req.body
    let {name} = req.body
    let {age} = req.body

    client.get(key, async function(err, obj){
        // Convert String to JSON
        let data = await JSON.parse(obj)

        for(var i=0; i<Object.keys(data).length; i++) {
            if (data[i].id == param) {

                // Override data lama dengan data update
                data[i].id = id
                data[i].name = name
                data[i].age = age
            }
            else{
                // console.log(data[i].name)
                // console.log('User Not Found!')
            }
        }

        // Convert JSON to String
        let jsonToStr = JSON.stringify(data)

        client.set(key, jsonToStr, function(err, reply){
            if(err) {
                console.log(err)
            }
            console.log(reply)

            res.send(`Update OK`)
        })
    })
})

// Delete
app.delete('/user/:id', function(req,res) {
    let key = 'user'
    let {id} = req.params

    client.get(key, async function(err, obj){
        let data = await JSON.parse(obj)

        for(var i=0; i<Object.keys(data).length; i++) {
            if (data[i].id == id) {
                data.splice([i], 1)
                // console.log(data)
            }
        }

        // Convert JSON to String
        let jsonToStr = JSON.stringify(data)

        client.set(key, jsonToStr, function(err, reply){
            if(err) {
                console.log(err)
            }
            console.log(reply)

            res.send(`Delete OK`)
        })
    })
})

app.listen(port, function(){
    console.log('Server started on port ' + port)
})