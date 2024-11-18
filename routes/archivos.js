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

router.post("/upload", upload.single("archivo"), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send("No se subió ningún archivo.");
    }

    const query = "INSERT INTO archivos (nombre, ruta) VALUES (?, ?)";
    db.query(query, [file.originalname, file.path], (err) => {
        if (err) {
            console.error("Error al guardar en la base de datos:", err.message);
            return res.status(500).send("Error interno del servidor.");
        }
        res.send("Archivo subido y guardado exitosamente.");
    });
});

router.get("/archivos", (req, res) => {
    const query = "SELECT id, nombre, fecha FROM archivos ORDER BY fecha DESC";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener archivos:", err.message);
            res.status(500).send("Error interno del servidor.");
        } else {
            res.json(results);
        }
    });
});

router.get("/archivo/:id", (req, res) => {
    const query = "SELECT ruta FROM archivos WHERE id = ?";
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error("Error al buscar archivo:", err.message);
            res.status(500).send("Error interno del servidor.");
        } else if (results.length === 0) {
            res.status(404).send("Archivo no encontrado.");
        } else {
            const filePath = path.resolve(results[0].ruta);
            res.sendFile(filePath);
        }
    });
});

module.exports = router;
