//**CHAMA O DRIVER SQL,EXPRESS E SWAGGER**
const express = require("express"); //npm install express
const mysql = require("mysql2"); //npm install mysql2
const cors = require("cors"); //npm install cors **NOVO**
const swaggerUi = require("swagger-ui-express"); //npm install express swagger-ui-express yamljs

const YAML = require("yamljs");

const app = express();

// configuração cors, evitando chamar um por um manualmente
app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load("./how-vii.yaml");

// http://localhost:4040/api-how-vii
app.use("/api-how-vii", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(4040, () => {
  console.log("Servidor rodando em http://localhost:4040/api-how-vii");
});

//**CONEXÃO DB**
const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "root";
const MYSQL_PASSWORD = "root";

//dados do DB com parâmetros de conexão
let connection = mysql.createConnection({
  host: MYSQL_IP,
  user: MYSQL_LOGIN,
  password: MYSQL_PASSWORD,
  port: 33100,
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
//função promise que será reaproveitada em todas as consultas
function buscaDB(connection, sql, parametro = []) {
  //o parametro fica aqui para a segurança de consultas que precisarem dele (previne sqlinjection)
  return new Promise((resolve, reject) => {
    connection.query(sql, parametro, function (err, result) {
      if (err) return reject(err); //caso de erro: retorna o erro
      resolve(result); //sem erro: retorno dos dados
    });
  });
}

//entrega 1 atualizada: o relatório do enunciado
//http://localhost:4040/pagamentos
app.get("/pagamentos", async (req, res) => {
  try {
    const sql = `SELECT p.codigo_imovel,  p.data_do_pagamento, p.valor_do_pagamento, 
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

// GRAFICO 1: soma de todos os pagamentos por ID de imóvel
app.get("/pagamentos_por_imovel", async (req, res) => {
  try {
    let sql = `SELECT codigo_imovel, valor_do_pagamento
    FROM gestao_imobiliaria.pagamento`;
    const resultado = await buscaDB(connection, sql);

    let totalPorImovel = new Map();
    console.log(resultado);

    resultado.forEach((registro) => {
      //atribuimos constrantes para o código não ficar repetitivo e para melhorar a manutenção
      const codigoImovel = registro["codigo_imovel"];
      const valor = Number.parseFloat(registro["valor_do_pagamento"]);

      //caso não haja registro na minha lista
      if (totalPorImovel.get(codigoImovel) === undefined) {
        totalPorImovel.set(codigoImovel, {
          id_imovel: codigoImovel, // conforme yaml
          valor_acumulado: valor, // conforme yaml
        });

        //caso haja registro
      } else {
        totalPorImovel.get(codigoImovel).valor_acumulado += valor;
      }
    });

    //transforma o mapeamento em array
    let arrayTotalPorImovel = Array.from(totalPorImovel.values());
    //mostra no console
    console.log("arrayTotalPorImovel", arrayTotalPorImovel);

    //envia o json e finaliza
    return res.json(arrayTotalPorImovel);
  } catch (erro) {
    console.error("Erro ao processar pagamentos por imóvel:", erro);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// GRAFICO 2: soma de todos os pagamentos por mês e ano
app.get("/pagamentos_por_mes_ano", async (req, res) => {
  try {
    let sql = `SELECT 
    YEAR(data_do_pagamento) AS ano, 
    MONTH(data_do_pagamento) AS mes, 
    valor_do_pagamento AS valor 
    FROM gestao_imobiliaria.pagamento`;
    const resultado = await buscaDB(connection, sql);

    let totalPorMesAno = new Map();

    resultado.forEach((registro) => {
      const ano = registro["ano"];
      const mes = registro["mes"];
      const valor = Number.parseFloat(registro["valor"]);
      const chave = `${ano}_${mes}`;

      //caso não haja registro no nosso map()
      if (totalPorMesAno.get(chave) === undefined) {
        totalPorMesAno.set(chave, {
          mes: mes, //conforme yaml
          ano: ano, // conforme yaml
          valor_total: valor, // conforme yaml
        });

        //caso haja registro
      } else {
        totalPorMesAno.get(chave).valor_total += valor;
      }
    });

    //transforma tudo em array
    let arrayTotalPorMesAno = Array.from(totalPorMesAno.values());

    console.log("arrayTotalPorMesAno:", arrayTotalPorMesAno);
    return res.json(arrayTotalPorMesAno);
  } catch (erro) {
    console.error("Erro ao processar pagamentos por mês/ano:", erro);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

//GRAFICO 3: percentual quantitativo por tipo de imóvel
app.get("/porcentagem_por_tipo_imovel", async (req, res) => {
  try {
    let sql = `
      SELECT t.descricao AS tipo_imovel
      FROM gestao_imobiliaria.pagamento AS p
      INNER JOIN gestao_imobiliaria.imovel AS i ON p.codigo_imovel = i.codigo_imovel
      INNER JOIN gestao_imobiliaria.tipo_imovel AS t ON i.id_tipo_imovel = t.id_tipo_imovel
    `;
    const resultado = await buscaDB(connection, sql);

    let contagemPorTipo = new Map();
    let totalGeralVendas = resultado.length; //quantidade total de registros

    //se não houver dados, retorna um array vazio para evitar divisão por zero
    if (totalGeralVendas === 0) {
      return res.json([]);
    }

    //conta a quantidade de registro de cada tipo de imóvel
    resultado.forEach((registro) => {
      const tipoImovel = registro["tipo_imovel"];

      if (contagemPorTipo.get(tipoImovel) === undefined) {
        contagemPorTipo.set(tipoImovel, {
          tipo_imovel: tipoImovel,
          quantidade: 1,
        });
      } else {
        contagemPorTipo.get(tipoImovel).quantidade += 1;
      }
    });

    //transforma o Map em Array e calcula o percentual de cada item
    let arrayPercentual = Array.from(contagemPorTipo.values()).map((item) => {
      const percentual = (item.quantidade / totalGeralVendas) * 100;

      return {
        tipo_imovel: item.tipo_imovel,
        quantidade: item.quantidade,
        percentual: Number.parseFloat(percentual.toFixed(2)), // ex: 45.50
      };
    });

    console.log("arrayPercentualPorTipo:", arrayPercentual);
    return res.json(arrayPercentual);
  } catch (erro) {
    console.error("Erro ao processar percentual por tipo de imóvel:", erro);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

//
console.log("API - Sistema Imobiliário HOW VII está rodando.");
