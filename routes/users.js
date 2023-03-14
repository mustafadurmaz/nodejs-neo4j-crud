const express = require('express');
const router = express.Router();
const graphDBConnect = require('../middleware/graphDBConnect');

require('dotenv').config();
const neo4j = require('neo4j-driver');

console.log(process.env.NEO4J_USER);
console.log(process.env.NEO4J_PASSWORD);

const uri = `neo4j://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`;
const driver = neo4j.driver(uri, neo4j.auth
    .basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const session = driver.session();

function formatResponse(resultObj) {
  const result = [];
  if (resultObj.records.length > 0) {
    resultObj.records.map(record => {
      result.push(record._fields[0].properties);
    });
  }
  return result;
}

router.post('/', async function(req, res) {
  console.log("test");
  const { id, name, email } = req.body;
  console.log(name);
  // if (!id || id < 1 || !name || !email) {
  //   return res.status(400).send('Invalid Inputs');
  // }

  // const query = `CREATE (n:Users {id:$id, name:$name, email: $email}) RETURN n`;
  // const params = {
  //   id: parseInt(id, 10),
  //   name,
  //   email
  // };
  // const resultObj = await graphDBConnect.executeCypherQuery(query, params);
  // const result = formatResponse(resultObj);
  // res.send(result);
  await session.run('CREATE (n:Users {name:$name, email: $email}) RETURN n',{
    name: name,
    email: email
    }).then(result => console.log(result.records[0].length>0))
    .catch(error => console.log(error))
    .then(session.close);
});

async function addPessoa(obj){
  await session.run('CREATE (p:Pessoa{nome:$nome, email:$email}) RETURN p',{
      nome: obj.nome,
      email: obj.email
      }).then(result => console.log(result.records[0].length>0))
      .catch(error => console.log(error))
      .then(session.close);
}


router.get('/', async function(req, res) {
  const query = 'MATCH (n:Users) RETURN n LIMIT 100';
  const params = {};
  const resultObj = await graphDBConnect.executeCypherQuery(query, params);
  const result = formatResponse(resultObj);
  res.send(result);
});
router.get('/:id', async function(req, res) {
  const { id } = req.params;
  const query = 'MATCH (n:Users {id: $id}) RETURN n LIMIT 100';
  const params = { id: parseInt(id, 10) };
  const resultObj = await graphDBConnect.executeCypherQuery(query, params);
  const result = formatResponse(resultObj);
  res.send(result);
});
router.patch('/:id', async function(req, res) {
  const { id } = req.params;
  const { name, email } = req.body;
  let strName = name ? ` n.name = '${name}' ` : '';
  let strEmail = email ? ` n.email = '${email}' ` : '';
  if (strName && strEmail) {
    strEmail = ',' + strEmail;
  }

  const query = `MATCH (n:Users {id: $id}) SET ${strName} ${strEmail} RETURN n`;
  const params = { id: parseInt(id, 10) };
  const resultObj = await graphDBConnect.executeCypherQuery(query, params);
  const result = formatResponse(resultObj);
  res.send(result);
});
router.delete('/:id', async function(req, res) {
  const { id } = req.params;
  const query = 'MATCH (n:Users {id: $id}) DELETE n';
  const params = { id: parseInt(id, 10) };
  const resultObj = await graphDBConnect.executeCypherQuery(query, params);
  res.send('Delete success');
});

module.exports = router;
