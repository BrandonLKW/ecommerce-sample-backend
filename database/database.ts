const pgdb = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = new pgdb.Pool({
  connectionString,
});

const testConnection = async () => {
  console.log(await (pool.query('SELECT NOW()')));
}
testConnection();

const query = async (text: String, params?: any[]) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch(error) {
        console.error("Error during DB query", error); //just log for now, to review if additional steps needed.
    }
}

module.exports = {
  query, 
};

//References
//https://stackoverflow.com/questions/48751505/how-can-i-choose-between-client-or-pool-for-node-postgres