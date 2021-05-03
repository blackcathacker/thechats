const { createServer } = require('./index')
const { createStore } = require('./store')

describe('persistent store', () => {
    let server, store
    const client1Write = jest.fn()
    beforeEach(() => {
        jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());
        store = createStore()
        server = createServer({ store })
        server.addClient('client1', { writeTo: client1Write })
        //clear mocks to reset welcome message by default
        client1Write.mockClear()
    })
    afterEach(() => {
        jest.runAllTimers()
        jest.useRealTimers()
    })
    it('persists all messages', () => {
        server.processClientInput('client1', 'A stored message')
        expect(store.get()).toHaveLength(2)
    })
    it('accepts a query param', () => {
        server.processClientInput('client1', 'A Stored Message')
        expect(store.get({q: 'stored'})).toHaveLength(1)
    })
})