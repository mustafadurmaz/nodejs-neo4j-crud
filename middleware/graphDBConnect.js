const neo4j = require('neo4j-driver');
const config = require('config');

const uri = config.get('dbHost');
const user = config.get('dbUser');
const password = config.get('dbPass');

console.log(uri);
console.log(user);
console.log(password);

// const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
//   maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
//   maxConnectionPoolSize: 50,
//   connectionAcquisitionTimeout: 2 * 60 * 1000, // 120 seconds
//   disableLosslessIntegers: true
// });

const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'ankara06'))

const session = driver.session();

async function executeCypherQuery(statement, params = {}) {
  try {
    const result = session.run(statement, params);
    console.log("success");
    session.close();
    return result;
  } catch (error) {
    console.log("don't success");
    throw error; // we are logging this error at the time of calling this method
  }
}

module.exports = { executeCypherQuery };
