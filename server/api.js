const express = require('express')
const bodyParser = require('body-parser')

function createRestApiServer(chatServer) {
    const app = express()

    app.use(bodyParser.json())

    app.post('/', (req, res) => {
        chatServer.postMessage(`http://${req.ip}`, req.body.name, req.body.message)
        res.send('Message sent')
    })
    app.get('/', (req, res) => {
        res.send(chatServer.getMessages(req.query))
    })

    return app
}

module.exports = { createRestApiServer }