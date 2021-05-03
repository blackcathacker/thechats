const net = require('net')

const REMOVE_TRAILING_NEWLINE = /\r?\n|\r$/
function onConnection(chatServer) {
    return sock => {
        const remoteAddress = sock.remoteAddress + ':' + sock.remotePort
        console.log('new connection from', remoteAddress)

        chatServer.addClient(remoteAddress, { writeTo: data => sock.write(data), disconnect: () => sock.end() })
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
}

function createTelnetServer(port, ip, chatServer) {
    const server = net.createServer(onConnection(chatServer)).on('error', err => {
        throw err
    }).listen(port, ip, () => {
        console.log('opened server on', server.address())
    })
    return server
}

module.exports = { createTelnetServer }
