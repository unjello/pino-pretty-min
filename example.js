const pino = require('pino')({level: 'trace'})

pino.info({what: 'pond', age: 100}, 'An old silent pond...')
pino.debug({animal: 'frog'}, 'A frog jumps into the pond')
pino.warn({obj: {type: 'pond', age: 100}, omg: true}, 'splash! Silence again')
pino.trace({season: 'autumn', timeOfDay: 'evening'}, 'Autumn moonlight—')
pino.info({animal: 'worm'}, 'a worm digs silently')
pino.fatal({author: 'Basho Matsuo'}, 'into the chestnut.')
