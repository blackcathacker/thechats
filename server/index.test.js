
const { createServer } = require('./index')

describe('chat server', () => {
    let server
    const client1Write = jest.fn()
    const client2Write = jest.fn()
    const client3Write = jest.fn()
    const logger = jest.fn()
    beforeEach(() => {
        jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());
        server = createServer({ logger })
        server.addClient('client1', { writeTo: client1Write })
        server.addClient('client2', { writeTo: client2Write })
        server.addClient('client3', { writeTo: client3Write })
        //clear mocks to reset welcome message by default
        client1Write.mockClear()
        client2Write.mockClear()
        client3Write.mockClear()
        logger.mockClear()
    })
    afterEach(() => {
        jest.runAllTimers()
        jest.useRealTimers()
    })
    test('writes intro message on connection', () => {
        const newClientWrite = jest.fn()
        server.addClient('newClient', { writeTo: newClientWrite })
        expect(newClientWrite).toHaveBeenCalled()
        expect(newClientWrite.mock.calls[0][0]).toContain('Welcome')
    })
    test('writes messages to other clients with timestamp and client name', () => {
        server.processClientInput('client1', 'A new message')
        const expectedMessage = '1/1/2020, 12:00:00 AM [client1] : A new message\n'
        expect(client1Write).not.toHaveBeenCalled()
        expect(client2Write).toHaveBeenCalledWith(expectedMessage)
        expect(client3Write).toHaveBeenCalledWith(expectedMessage)
    })
    test('clients can update name via command', () => {
        server.processClientInput('client1', ':name NewClient1')
        server.processClientInput('client1', 'Another new message')
        const expectedMessage = '1/1/2020, 12:00:00 AM [NewClient1] : Another new message\n'
        expect(client1Write).not.toHaveBeenCalled()
        expect(client2Write).toHaveBeenCalledWith(expectedMessage)
        expect(client3Write).toHaveBeenCalledWith(expectedMessage)
    })
    test('server calls log for all messages', () => {
        server.addClient('client4')
        expect(logger).toHaveBeenCalledWith({ id: 'client4', name: 'client4', room: 'default', writeTo: expect.any(Function) }, 'connected')
        server.processClientInput('client4', 'Hello all')
        expect(logger).toHaveBeenCalledWith({ id: 'client4', name: 'client4', room: 'default', writeTo: expect.any(Function) }, 'Hello all')
    })
})