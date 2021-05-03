const net = require('net')
const { createServer } = require('./server')
const { createLogger } = require('./server/file-logger')

const PORT = 1337
const IPADDR = '127.0.0.1'
const LOG_FILE = 'server.log'

const chatServer = createServer({ logger: createLogger(LOG_FILE) })
const netServer = net.createServer(onConnection).on('error', err => {
    throw err
}).listen(PORT, IPADDR, () => {
    console.log('opened server on', netServer.address())
})

const REMOVE_TRAILING_NEWLINE = /\r?\n|\r$/
function onConnection(sock) {
    const remoteAddress = sock.remoteAddress + ':' + sock.remotePort
    console.log('new connection from', remoteAddress)

    chatServer.addClient(remoteAddress, { writeTo: data => sock.write(data) })
    sock.on('data', data => {
        try {
            chatServer.processClientInput(remoteAddress, data.toString().replace(REMOVE_TRAILING_NEWLINE, ''))
        } catch (err) {
            console.error('Error in chat server', err)
        }
    })
    sock.on('error', err => {
        console.error(`Error from ${remoteAddress}`, err)
    })
}
