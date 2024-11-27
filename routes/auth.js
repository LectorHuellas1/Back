const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

const JWT_SECRET = "claveC123456";

router.post("/register", async (req, res) => {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    try {
        const queryCheck = "SELECT id FROM usuarios WHERE correo = ?";
        const [rows] = await db.query(queryCheck, [correo]); 

        if (rows.length > 0) {
            return res.status(400).send("El email ya está registrado.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const queryInsert = "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)";
        await db.query(queryInsert, [nombre, correo, hashedPassword]);

        res.send("Usuario registrado exitosamente.");
    } catch (err) {
        console.error("Error al registrar usuario:", err.message);
        res.status(500).send("Error interno del servidor.");
    }
});

router.post("/login", async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    try {
        const querySelect = "SELECT * FROM usuarios WHERE correo = ?";
        const [result] = await db.query(querySelect, [correo]);

        if (result.length === 0) {
            return res.status(400).send("Email o contraseña incorrectos.");
        }

        const user = result[0];

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Email o contraseña incorrectos.");
        }

        // Crear un token JWT
        const token = jwt.sign({ id: user.id, nombre: user.nombre }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login exitoso.", token });
    } catch (err) {
        console.error("Error al iniciar sesión:", err.message);
        res.status(500).send("Error interno del servidor.");
    }
});

// Middleware para proteger rutas
function verificarToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).send("Acceso denegado.");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Token inválido.");
        req.user = user;
        next();
    });
}

// Ruta protegida de ejemplo
router.get("/perfil", verificarToken, (req, res) => {
    res.send(`Hola ${req.user.nombre}, este es tu perfil.`);
});

module.exports = router;
