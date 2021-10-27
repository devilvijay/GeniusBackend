const Pool = require("pg").Pool;
const env= require('../../env');
//heroku
const databaseConfig = { connectionString: env.database_url, ssl: {
    rejectUnauthorized: false
  } };
//local 
// const databaseConfig = { connectionString: env.database_url };
const pool = new Pool(databaseConfig);
console.log(env.database_url);
module.exports =pool;
// const Pool = require("pg").Pool;

// const pool =new Pool({
//         user: "postgres",
//         password: "vijay",
//         database: "genius",
//         host: "localhost",
//         port: 5432
// });

// module.exports =pool;