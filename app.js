const express = require('express')
const config = require('config')
const path = require('path')
const mongoose = require('mongoose')
const socketIo = require("socket.io");
const PORT = config.get('port') || 5000
const http = require("http")
const app = express()
const server = http.createServer(app).listen(PORT, () => console.log(`App has been starte on port ${PORT}...`))

const io = socketIo(server, {
  cors: {
    origin: "http://ec2-3-86-29-164.compute-1.amazonaws.com:8080",
    credentials: true
  }
} );






module.exports = io;


app.use(express.json({ extended: true }))

app.use('/api/auth' , require('./routes/auth.routes'))
app.use('/api/flex' , require('./routes/amzbot.routes'))


if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}



async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    server
  } catch (e) {

    console.log('Server Error', e.message)
    // process.exit(1)
  }
}
module.exports.getIO = function(){
  return io;
}
start()

