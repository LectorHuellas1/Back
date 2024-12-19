const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Subir archivo
router.post("/upload", upload.single("archivo"), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send("No se subió ningún archivo.");
    }

    const query = "INSERT INTO archivos (nombre, ruta) VALUES (?, ?)";

    try {
        await db.query(query, [file.originalname, file.path]); // Uso de await para Promises
        res.send("Archivo subido y guardado exitosamente.");
    } catch (err) {
        console.error("Error al guardar en la base de datos:", err.message);
        res.status(500).send("Error interno del servidor.");
    }
});

// Obtener lista de archivos
router.get("/archivos", async (req, res) => {
    const query = "SELECT id, nombre, fecha FROM archivos ORDER BY fecha DESC";

    try {
        const [results] = await db.query(query); // `results` contiene los datos
        res.json(results);
    } catch (err) {
        console.error("Error al obtener archivos:", err.message);
        res.status(500).send("Error interno del servidor.");
    }
});

// Obtener un archivo específico por ID
router.get("/archivo/:id", async (req, res) => {
    const query = "SELECT ruta FROM archivos WHERE id = ?";

    try {
        const [results] = await db.query(query, [req.params.id]);

        if (results.length === 0) {
            res.status(404).send("Archivo no encontrado.");
        } else {
            const filePath = path.resolve(results[0].ruta);
            res.sendFile(filePath);
        }
    } catch (err) {
        console.error("Error al buscar archivo:", err.message);
        res.status(500).send("Error interno del servidor.");
    }
});

module.exports = router;
