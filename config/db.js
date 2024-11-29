const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "db4free.net",    
    user: "kirbynigg",         
    password: "123456ggg",  
    database: "lector",  
});

module.exports = db;
