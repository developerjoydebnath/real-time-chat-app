import { Server } from "socket.io";

const io = new Server({cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }});

// declare the online users array 
let onlineUsers = [];

io.on('connection', (socket) => {
    console.log(socket.id);
    socket.on('addUser', (userId) => {
        
        !onlineUsers.some(user => user.userId === userId) && userId &&
        onlineUsers.push({
            socketId: socket.id,
            userId,
        })

        io.emit('online-users', onlineUsers)
    })

    socket.on('addNewUser', (user) => {
        io.emit('added-new-user', user)
    })

    socket.on('sendMessage', (messageDetail) => {
        const receiver = onlineUsers?.find(user => user.userId === messageDetail?.receiverId)
        if(receiver?.socketId) {
            io.to(receiver.socketId).emit('get-message', messageDetail)
        }
    })

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
        io.emit('online-users', onlineUsers)
    });
})

io.listen(5000)