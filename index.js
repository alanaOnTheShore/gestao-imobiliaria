//**CHAMA O DRIVER SQL,EXPRESS E SWAGGER**
const express = require("express"); //npm install express
const mysql = require("mysql2"); //npm install mysql2

const swaggerUi = require("swagger-ui-express"); //npm install express swagger-ui-express yamljs
const YAML = require("yamljs");

const app = express();
const swaggerDocument = YAML.load("./how-vii.yaml");

app.use("/api-how-vii", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(4040, () => {
  console.log("Servidor rodando em http://localhost:4040/api-how-vii");
}); //inicializa web server

//**CONEXÃO DB**
const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "root";
const MYSQL_PASSWORD = "root";

//dados do DB com parâmetros de conexão
let connection = mysql.createConnection({
  host: MYSQL_IP,
  user: MYSQL_LOGIN,
  password: MYSQL_PASSWORD,
  port: 33100, //O PROFESSOR NÃO USA A PORTA ??
  database: "gestao_imobiliaria",
});

//testa a conexão e exibe uma mensagem
connection.connect(function (err) {
  //caso a conexão dê erro
  if (err) {
    console.log(err); //informa que teve erro
    throw err; //aborta o programa
  }

  //se não houver erro
  console.log("Conexão com o mysql estabelecida.");
});

//**FUNÇÕES**
/*essas funções poderiam ser feitas mais diretamente graças ao mysql2, 
mas escolhi deixar mais explicitas para o how*/

//função promise que será reaproveitada em todas as consultas
function buscaDB(connection, sql, parametro = []) {
  //o parametro fica aqui para a segurança de consultas que precisarem dele (previne sqlinjection)
  return new Promise((resolve, reject) => {
    connection.query(sql, parametro, function (err, result) {
      if (err) return reject(err); //caso de erro
      resolve(result); //sem erro: retorno dos dados
    });
  });
}

//entrega 1 atualizada: o relatório do enunciado
//http://localhost:4040/pagamentos
app.get("/pagamentos", async (req, res) => {
  try {
    const sql = `SELECT p.id_venda,  p.data_do_pagamento, p.valor_do_pagamento, p.codigo_imovel, 
    i.descricao_imovel, t.descricao AS tipo_imovel
    FROM pagamento AS p
    INNER JOIN imovel AS i ON p.codigo_imovel = i.codigo_imovel
    INNER JOIN tipo_imovel AS t ON i.id_tipo_imovel = t.id_tipo_imovel`;
    const dados = await buscaDB(connection, sql);
    //retorno em json
    res.json(dados);
  } catch (erro) {
    console.error("Erro na consulta do banco:", erro);
    res.status(500).json({ erro: "Erro ao buscar dados no banco" });
  }
});

//AS OUTRAS FUNÇÕES VIRÃO AQUI

console.log("API - Sistema Imobiliário HOW VII está rodando.");
