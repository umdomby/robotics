const express = require('express')
const username = require('username-generator')
const path = require('path')
const fs = require("fs");

//const shortid = require('shortid');
//console.log(shortid.generate());

const privateKey = fs.readFileSync(path.resolve(__dirname,'../cert/servicerobotpro/privkey.pem'));
const certificate = fs.readFileSync(path.resolve(__dirname,'../cert/servicerobotpro/cert.pem'));
const ca = fs.readFileSync(path.resolve(__dirname,'../cert/servicerobotpro/chain.pem'));
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};



//const http = require("http");
const https = require('https');
const app = express()
//const server = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
const socket = require('socket.io')

const io = socket(httpsServer)


//const { AwakeHeroku } = require('awake-heroku');

// AwakeHeroku.add({
//     url: "https://cuckooapp.herokuapp.com"
// })

// app.use(express.static('./client/build'));
//
// app.get('*', (req,res)=>{
//     res.sendFile(path.resolve(__dirname, "client","build","index.html"));
// })

const users={}
function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

io.on('connection', socket => {

    socket.on('myId', (data) => {
        // const userid = randomIntFromInterval(1000, 9999)
        const userid = data.myId
        console.log(userid)

        if(!users[userid]){
            users[userid] = socket.id
        }

        socket.emit('yourID', userid)
        console.log(users)

        io.sockets.emit('allUsers', users)
        socket.on('disconnect', ()=>{
            delete users[userid]
        })
    })

    socket.on('callUser', (data)=>{
        io.to(users[data.userToCall]).emit('hey', {signal: data.signalData, from: data.from})
    })

    socket.on('acceptCall', (data)=>{
        io.to(users[data.to]).emit('callAccepted', data.signal)
    })

    socket.on('close', (data)=>{
        console.log('CLOSED')
        io.to(users[data.to]).emit('close')
    })

    socket.on('rejected', (data)=>{
        io.to(users[data.to]).emit('rejected')
    })

    // setTimeout(()=>{
    //     if(!users[userid]){
    //         users[userid] = socket.id
    //     }
    //
    //     socket.emit('yourID', userid)
    //     console.log(users)
    //
    //     io.sockets.emit('allUsers', users)
    //     socket.on('disconnect', ()=>{
    //         delete users[userid]
    //     })
    //
    //     socket.on('callUser', (data)=>{
    //         io.to(users[data.userToCall]).emit('hey', {signal: data.signalData, from: data.from})
    //     })
    //
    //     socket.on('acceptCall', (data)=>{
    //         io.to(users[data.to]).emit('callAccepted', data.signal)
    //     })
    //
    //     socket.on('close', (data)=>{
    //         io.to(users[data.to]).emit('close')
    //     })
    //
    //     socket.on('rejected', (data)=>{
    //         io.to(users[data.to]).emit('rejected')
    //     })
    // }, 1000)

})

// const port = process.env.PORT || 8000
//
// server.listen(port, ()=>{
//     console.log(`Server running on port ${port}`)
// })

httpsServer.listen(4433, () => {
    console.log('HTTPS Server running on port 4433');
});