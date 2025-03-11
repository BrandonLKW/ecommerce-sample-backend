const pgdb = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = new pgdb.Pool({
  connectionString,
});

const testConnection = async () => {
  console.log(await (pool.query('SELECT NOW()')));
  // await pool.end();
}

testConnection();

const query = (text: String, params: String) => pool.query(text, params);
module.exports = {
  query, 
};


//References
//https://stackoverflow.com/questions/48751505/how-can-i-choose-between-client-or-pool-for-node-postgres