# ✦ Todo App — Lista de Tarefas

Aplicação web de lista de tarefas com frontend em HTML/CSS/JS e backend em Node.js + Express, com testes automatizados via Cypress e CI/CD com GitHub Actions.

## 🗂 Estrutura

```
todo-app/
├── frontend/
│   ├── index.html          # Interface da aplicação
│   └── app.js              # Lógica do frontend
├── backend/
│   └── server.js           # API REST com Express
├── cypress/
│   ├── e2e/
│   │   ├── frontend.cy.js  # Testes E2E do frontend
│   │   └── backend.cy.js   # Testes da API backend
│   └── support/
│       ├── e2e.js
│       └── commands.js
├── .github/
│   └── workflows/
│       ├── frontend-tests.yml
│       └── backend-tests.yml
├── cypress.config.js
└── package.json
```

## 🚀 Como rodar

### Instalar dependências
```bash
npm install
```

### Rodar a aplicação
```bash
npm start
```
Acesse: http://localhost:3000

### Rodar todos os testes (modo headless)
```bash
# Frontend
npm run cypress:frontend

# Backend
npm run cypress:backend

# Abrir Cypress interativo
npm run cypress:open
```

## 📡 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/todos` | Listar todas as tarefas |
| `GET` | `/api/todos/:id` | Buscar tarefa por ID |
| `POST` | `/api/todos` | Criar nova tarefa |
| `PUT` | `/api/todos/:id` | Atualizar tarefa |
| `DELETE` | `/api/todos/:id` | Excluir tarefa |
| `DELETE` | `/api/todos` | Excluir todas as tarefas |

### Exemplo de payload (POST/PUT)
```json
{
  "title": "Minha tarefa",
  "description": "Descrição opcional",
  "completed": false
}
```

## ⚙️ GitHub Actions

Dois workflows são disparados automaticamente em cada `push`:

- **`frontend-tests.yml`** — executa `cypress/e2e/frontend.cy.js`
- **`backend-tests.yml`** — executa `cypress/e2e/backend.cy.js`

Ambos iniciam o servidor, aguardam ele ficar disponível e rodam os testes no modo headless.

## 🧪 Cobertura de testes

**Frontend:**
- Carregamento da página
- Adicionar tarefa (com/sem descrição, via Enter, validação)
- Completar/desmarcar tarefa
- Editar tarefa (modal, salvar, cancelar)
- Excluir tarefa
- Filtros (todas / pendentes / concluídas)
- Estatísticas (contadores)

**Backend (API):**
- `GET` lista vazia e com dados
- `GET` por ID — sucesso e 404
- `POST` com validações (título obrigatório, trim, IDs únicos)
- `PUT` — atualizar título, status, validações
- `DELETE` individual e em massa
- Headers `Content-Type`
