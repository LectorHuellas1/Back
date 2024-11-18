const mysql = require("mysql");

const db = mysql.createConnection({
    host: "db4free.net",    
    user: "kirbynigg",         
    password: "123456ggg",  
    database: "lector",  
});

db.connect(err => {
    if (err) {
        console.error(`Error al conectar a la base de datos en db4free.net:
        - Host: ${db.config.host}
        - Usuario: ${db.config.user}
        - Mensaje: ${err.message}`);
        return;
    }
    console.log("Conectado a la base de datos en db4free.");
});

module.exports = db;
