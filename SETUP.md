# 🛠️ Setup Local - AnimaList

## Pré-requisitos
- Node.js 18+
- MySQL 8+
- npm ou pnpm

## 1. Clone e Instale

\`\`\`bash
# Clone o repositório
git clone <https://github.com/input-name-Guilherme-araujo/Pi-2-semestre---DSM> ou baixe diretamente pelo github

cd animalist

# Backend
cd backend
npm install
cp .env.example .env

# Frontend (novo terminal)
"cd frontend"

"npm install"


## 2. Configure MySQL

MySql:

-- Crie o banco
CREATE DATABASE animalist;
USE animalist;

-- Saia do MySQL
exit


## 3. Configure Variáveis

### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=animalist
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
\`\`\`

### Frontend (.env.local)
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

## 4. Execute Migrations e Seed

No terminal:

"cd backend"

# Criar tabelas

"npm run migrate"

# Popular com dados de exemplo

"npm run seed"


## 5. Inicie os Servidores

No terminal:

# Backend (terminal 1)
"cd backend"

"npm run dev"

# Frontend (terminal 2)  
"cd frontend"

"npm run dev"


## 6. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 7. Login de Teste

Após executar o seed:
- **Email**: admin@animalist.com
- **Senha**: admin123

## Comandos Úteis

No terminal:

# Backend
"npm run dev"      # Desenvolvimento
"npm start"       # Produção
"npm run migrate"  # Executar migrations
"npm run seed"    # Popular dados

# Frontend
"npm run dev"     # Desenvolvimento
"npm run build"   # Build produção
"npm run preview"  # Preview build


## Estrutura do Projeto


animalist/
├── backend/
│   ├── config/          # Configurações
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Middlewares
│   ├── routes/          # Rotas da API
│   ├── scripts/         # Scripts utilitários
│   └── server.js        # Servidor principal
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Context API
│   │   ├── lib/         # Utilitários
│   │   ├── pages/       # Páginas
│   │   └── App.jsx      # App principal
│   └── public/          # Arquivos estáticos
└── database/
    └── schema.sql       # Schema do banco
