import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const productionUrl = process.env.VERCEL_URL;

const io = new Server(expressServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? [productionUrl] : ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  },
});

var clients = 0;
io.on("connection", function (socket) {
  clients++;
  io.sockets.emit("broadcast", { description: clients });
  socket.on("newuser", function (username) {
    socket.broadcast.emit("update", username + " bergabung ke obrolan");
  });
  socket.on("exituser", function (username) {
    socket.broadcast.emit("update", username + " meninggalkan ke obrolan");
  });
  socket.on("chat", function (message) {
    socket.broadcast.emit("chat", message);
  });
  socket.on("disconnect", function () {
    clients--;
    io.sockets.emit("broadcast", { description: clients });
  });
});
