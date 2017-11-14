import * as mongoose from 'mongoose'
mongoose.Promise = global.Promise
// mongoose.set('debug', true);

export default async (mongo_uri) => {
  let db = mongoose.connection

  db.on('error', console.error.bind(console, 'mongoose connection error:'))
  db.once('open', () => {
    return console.log('[mongo] opened successfully')
  })

  let exit = () => {
    db.close(() => {
      console.log('[mongo] info: mongo is disconnected through app termination')
      process.exit(0)
    })
  }

  process.on('SIGINT', exit).on('SIGTERM', exit)
  try {
    await mongoose.connect(mongo_uri)
  } catch (err) {
    console.log(`[mongo] Error connecting to: ${mongo_uri}. ${err}`)
    return process.exit(1)
  }
}