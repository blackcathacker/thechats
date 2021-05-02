const net = require('net')

const PORT = 1337
const IPADDR = '127.0.0.1'

const server = net.createServer(onConnection).on('error', err => {
    throw err
}).listen(PORT, IPADDR, () => {
    console.log('opened server on', server.address())
})

function onConnection(sock) {
    const remoteAddress = sock.remoteAddress + ':' + sock.remotePort
    console.log('new connection from', remoteAddress)

    sock.on('data', data => {
        console.log(`${remoteAddress} says: ${data}`)
    })
    sock.on('error', err => {
        console.error(`Error from ${remoteAddress}`, err)
    })
}