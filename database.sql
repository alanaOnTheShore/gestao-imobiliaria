CREATE DATABASE IF NOT EXISTS gestao_imobiliaria;
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gestao_imobiliaria;

-- Tabelas
DROP TABLE IF EXISTS pagamento;
DROP TABLE IF EXISTS imovel;
DROP TABLE IF EXISTS tipo_imovel;

CREATE TABLE tipo_imovel (
    id_tipo_imovel INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL
);

CREATE TABLE imovel (
    codigo_imovel INT AUTO_INCREMENT PRIMARY KEY,
    descricao_imovel VARCHAR(255) NOT NULL,
    id_tipo_imovel INT NOT NULL,
    FOREIGN KEY (id_tipo_imovel) REFERENCES tipo_imovel(id_tipo_imovel)
);

CREATE TABLE pagamento (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    data_do_pagamento DATE NOT NULL,
    valor_do_pagamento DECIMAL(10,2) NOT NULL,
    codigo_imovel INT NOT NULL,
    FOREIGN KEY (codigo_imovel) REFERENCES imovel(codigo_imovel)
);

-- Inserção dos tipos de imóvel (5 tipos diferentes)
INSERT INTO tipo_imovel (descricao) VALUES
('Apartamento'),
('Casa'),
('Terreno'),
('Sala Comercial'),
('Galpão');

-- Inserção de 8 imóveis diferentes
-- 3 tipos diferentes
INSERT INTO imovel (descricao_imovel, id_tipo_imovel) VALUES
('Apartamento 100 m2 em condomínio fechado', 1),
('Apartamento 80 m2 no centro da cidade', 1),
('Casa 150 m2 em bairro residencial', 2),
('Casa 200 m2 em condomínio fechado', 2),
('Terreno 500 m2 em área comercial', 3),
('Terreno 300 m2 em loteamento residencial', 3),
('Sala comercial 40 m2 em centro empresarial', 4),
('Galpão 800 m2 em distrito industrial', 5);

-- Inserção de pagamentos
-- 32 registros, distribuídos em 5 meses diferentes:
--  04/2023, 05/2023, 06/2023, 07/2023, 08/2023,
--  todos os 8 imóveis com pelo menos 1 pagamento

INSERT INTO pagamento (data_do_pagamento, valor_do_pagamento, codigo_imovel) VALUES
-- Abril/2023
('2023-04-05', 5000.00, 1),
('2023-04-08', 4200.00, 2),
('2023-04-10', 7800.00, 3),
('2023-04-15', 9500.00, 4),
('2023-04-18', 12000.00, 5),
('2023-04-22', 6300.00, 6),
('2023-04-25', 3800.00, 7),
('2023-04-28', 15000.00, 8),

-- Maio/2023
('2023-05-03', 5100.00, 1),
('2023-05-07', 4300.00, 2),
('2023-05-11', 8000.00, 3),
('2023-05-14', 9700.00, 4),
('2023-05-19', 11800.00, 5),
('2023-05-21', 6400.00, 6),
('2023-05-26', 4000.00, 7),

-- Junho/2023
('2023-06-02', 5200.00, 1),
('2023-06-06', 4400.00, 2),
('2023-06-09', 8100.00, 3),
('2023-06-13', 9600.00, 4),
('2023-06-17', 12500.00, 5),
('2023-06-20', 6500.00, 6),
('2023-06-24', 15500.00, 8),

-- Julho/2023
('2023-07-01', 5300.00, 1),
('2023-07-05', 4500.00, 2),
('2023-07-09', 8200.00, 3),
('2023-07-12', 9800.00, 4),
('2023-07-16', 12200.00, 5),
('2023-07-20', 4100.00, 7),
('2023-07-25', 15800.00, 8),

-- Agosto/2023
('2023-08-02', 5000.00, 1),
('2023-08-06', 8300.00, 3),
('2023-08-10', 9900.00, 4),
('2023-08-14', 6600.00, 6);

-- Consulta SQL com JOIN entre as 3 tabelas
SELECT p.id_venda,  p.data_do_pagamento, p.valor_do_pagamento, p.codigo_imovel, i.descricao_imovel, t.descricao AS tipo_imovel
    FROM pagamento AS p
    INNER JOIN imovel AS i ON p.codigo_imovel = i.codigo_imovel
    INNER JOIN tipo_imovel AS t ON i.id_tipo_imovel = t.id_tipo_imovel;