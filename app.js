const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./db.json');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const fs = require('fs');
const { Client } = require('pg');
const cors = require('cors');
app.use(express.json());




const corsOptions = {
    origin: '*', // Địa chỉ nguồn bạn muốn cho phép
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức được phép
    credentials: true, // Cho phép gửi cookie (nếu cần)
    optionsSuccessStatus: 204, // Trả về mã trạng thái 204 (No Content) cho yêu cầu kiểm tra trước
};

app.use(cors(corsOptions));

// API route để lấy danh sách người dùng
app.get('/users', (req, res) => {
    try {
        const users = db.user;
        return res.status(200).json({ message: 'Lay thanh cong', data: users });
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err });
    }
});
app.post('/adduser', (req, res) => {
    try {
        // Lấy tên người dùng từ yêu cầu
        const { name, id } = req.body

        const user = { id, name };
        // Tạo một id tự động bằng thời gian hiện tại (ví dụ: timestamp)
        // Thêm người dùng vào cơ sở dữ liệu (trong trường hợp này, db.json)
        db.user.push(user);
        fs.writeFileSync('db.json', JSON.stringify(db));
        console.log(db.user); 
        const users = db.user;
        // Gửi tin nhắn đến tất cả các kết nối WebSocket để thông báo thay đổi
        io.emit('user_added', { message: 'Người dùng đã được thêm', user: { id, name } });
        return res.status(200).json({ message: 'Thêm người dùng thành công', users });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        io.emit('message', message); // Gửi tin nhắn tới tất cả các kết nối
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});