CREATE DATABASE IF NOT EXISTS animalist;
USE animalist;

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role_id INT DEFAULT 2,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE generos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE animacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    titulo_original VARCHAR(255),
    sinopse TEXT,
    poster_url VARCHAR(500),
    banner_url VARCHAR(500),
    ano_lancamento YEAR,
    episodios INT DEFAULT 1,
    status ENUM('Em exibição', 'Finalizado', 'Cancelado', 'Anunciado') DEFAULT 'Finalizado',
    estudio VARCHAR(100),
    diretor VARCHAR(100),
    nota_media DECIMAL(3,2) DEFAULT 0.00,
    total_avaliacoes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE animacao_generos (
    animacao_id INT,
    genero_id INT,
    PRIMARY KEY (animacao_id, genero_id),
    FOREIGN KEY (animacao_id) REFERENCES animacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

CREATE TABLE avaliacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    animacao_id INT NOT NULL,
    nota DECIMAL(2,1) NOT NULL CHECK (nota >= 0 AND nota <= 10),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_anime (usuario_id, animacao_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (animacao_id) REFERENCES animacoes(id) ON DELETE CASCADE
);

CREATE TABLE lista_pessoal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    animacao_id INT NOT NULL,
    status ENUM('assistido', 'desejado', 'assistindo', 'pausado', 'abandonado') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_anime_list (usuario_id, animacao_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (animacao_id) REFERENCES animacoes(id) ON DELETE CASCADE
);

CREATE TABLE comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    animacao_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    moderado BOOLEAN DEFAULT FALSE,
    aprovado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (animacao_id) REFERENCES animacoes(id) ON DELETE CASCADE
);

INSERT INTO roles (nome, descricao) VALUES 
('admin', 'Administrador do sistema'),
('user', 'Usuário comum');

INSERT INTO generos (nome, descricao, cor) VALUES 
('Ação', 'Animações com foco em combates e aventuras', '#ef4444'),
('Romance', 'Histórias focadas em relacionamentos amorosos', '#ec4899'),
('Comédia', 'Animações com foco no humor', '#f59e0b'),
('Drama', 'Histórias emocionalmente intensas', '#8b5cf6'),
('Fantasia', 'Mundos mágicos e sobrenaturais', '#06b6d4'),
('Ficção Científica', 'Futurismo e tecnologia avançada', '#10b981'),
('Terror', 'Suspense e elementos assustadores', '#1f2937'),
('Slice of Life', 'Retrato da vida cotidiana', '#84cc16');

INSERT INTO animacoes (titulo, titulo_original, sinopse, ano_lancamento, episodios, status, estudio, diretor) VALUES 
('Attack on Titan', 'Shingeki no Kyojin', 'A humanidade vive cercada por muralhas para se proteger dos titãs, criaturas gigantes que devoram humanos.', 2013, 87, 'Finalizado', 'Studio Pierrot', 'Tetsuro Araki'),
('Demon Slayer', 'Kimetsu no Yaiba', 'Tanjiro se torna um caçador de demônios para salvar sua irmã que foi transformada em demônio.', 2019, 44, 'Em exibição', 'Ufotable', 'Haruo Sotozaki'),
('Your Name', 'Kimi no Na wa', 'Dois adolescentes descobrem que estão conectados de uma forma sobrenatural.', 2016, 1, 'Finalizado', 'CoMix Wave Films', 'Makoto Shinkai');

INSERT INTO animacao_generos (animacao_id, genero_id) VALUES 
(1, 1), (1, 4), (1, 6),
(2, 1), (2, 6), (2, 4),
(3, 2), (3, 4), (3, 5);
