const express = require("express");
const cors = require("cors");
const path = require("path");
const archivoRoutes = require("./routes/archivos");
const authRoutes = require("./routes/auth");


const app = express();

// Configurar CORS
app.use(cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", archivoRoutes);
app.use("/auth", authRoutes);

app.use("/", archivoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
