/// <reference types="cypress" />

const API = '/api/todos';

describe('Backend - API de Tarefas', () => {
  beforeEach(() => {
    cy.request('DELETE', API);
  });

  // ── GET /api/todos ──────────────────────────────────
  describe('GET /api/todos', () => {
    it('deve retornar lista vazia inicialmente', () => {
      cy.request(API).then(res => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.an('array').that.is.empty;
      });
    });

    it('deve retornar as tarefas criadas', () => {
      cy.request('POST', API, { title: 'Tarefa A' });
      cy.request('POST', API, { title: 'Tarefa B' });

      cy.request(API).then(res => {
        expect(res.body.data).to.have.length(2);
      });
    });
  });

  // ── GET /api/todos/:id ──────────────────────────────
  describe('GET /api/todos/:id', () => {
    it('deve retornar uma tarefa pelo ID', () => {
      cy.request('POST', API, { title: 'Tarefa específica' }).then(create => {
        const id = create.body.data.id;
        cy.request(`${API}/${id}`).then(res => {
          expect(res.status).to.eq(200);
          expect(res.body.data.id).to.eq(id);
          expect(res.body.data.title).to.eq('Tarefa específica');
        });
      });
    });

    it('deve retornar 404 para ID inexistente', () => {
      cy.request({ url: `${API}/id-inexistente`, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(404);
        expect(res.body.success).to.be.false;
      });
    });
  });

  // ── POST /api/todos ────────────────────────────────
  describe('POST /api/todos', () => {
    it('deve criar uma tarefa com título', () => {
      cy.request('POST', API, { title: 'Nova tarefa' }).then(res => {
        expect(res.status).to.eq(201);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.eq('Nova tarefa');
        expect(res.body.data.completed).to.be.false;
        expect(res.body.data.id).to.be.a('string');
        expect(res.body.data.createdAt).to.be.a('string');
      });
    });

    it('deve criar uma tarefa com título e descrição', () => {
      cy.request('POST', API, { title: 'Tarefa completa', description: 'Com descrição' }).then(res => {
        expect(res.status).to.eq(201);
        expect(res.body.data.description).to.eq('Com descrição');
      });
    });

    it('deve remover espaços extras do título', () => {
      cy.request('POST', API, { title: '  Título com espaços  ' }).then(res => {
        expect(res.body.data.title).to.eq('Título com espaços');
      });
    });

    it('deve retornar 400 quando título está ausente', () => {
      cy.request({ method: 'POST', url: API, body: {}, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.include('Title is required');
      });
    });

    it('deve retornar 400 quando título está vazio', () => {
      cy.request({ method: 'POST', url: API, body: { title: '   ' }, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve gerar IDs únicos para cada tarefa', () => {
      cy.request('POST', API, { title: 'Tarefa 1' }).then(r1 => {
        cy.request('POST', API, { title: 'Tarefa 2' }).then(r2 => {
          expect(r1.body.data.id).to.not.eq(r2.body.data.id);
        });
      });
    });
  });

  // ── PUT /api/todos/:id ────────────────────────────
  describe('PUT /api/todos/:id', () => {
    let todoId;

    beforeEach(() => {
      cy.request('POST', API, { title: 'Tarefa para editar', description: 'Desc original' }).then(res => {
        todoId = res.body.data.id;
      });
    });

    it('deve atualizar o título da tarefa', () => {
      cy.request('PUT', `${API}/${todoId}`, { title: 'Título atualizado' }).then(res => {
        expect(res.status).to.eq(200);
        expect(res.body.data.title).to.eq('Título atualizado');
      });
    });

    it('deve marcar tarefa como concluída', () => {
      cy.request('PUT', `${API}/${todoId}`, { completed: true }).then(res => {
        expect(res.body.data.completed).to.be.true;
      });
    });

    it('deve desmarcar tarefa concluída', () => {
      cy.request('PUT', `${API}/${todoId}`, { completed: true });
      cy.request('PUT', `${API}/${todoId}`, { completed: false }).then(res => {
        expect(res.body.data.completed).to.be.false;
      });
    });

    it('deve retornar 400 ao atualizar título para vazio', () => {
      cy.request({ method: 'PUT', url: `${API}/${todoId}`, body: { title: '' }, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(400);
      });
    });

    it('deve retornar 404 ao atualizar ID inexistente', () => {
      cy.request({ method: 'PUT', url: `${API}/nao-existe`, body: { title: 'x' }, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(404);
      });
    });

    it('deve adicionar updatedAt ao atualizar', () => {
      cy.request('PUT', `${API}/${todoId}`, { title: 'Atualizado' }).then(res => {
        expect(res.body.data.updatedAt).to.be.a('string');
      });
    });
  });

  // ── DELETE /api/todos/:id ─────────────────────────
  describe('DELETE /api/todos/:id', () => {
    it('deve excluir uma tarefa existente', () => {
      cy.request('POST', API, { title: 'Para deletar' }).then(res => {
        const id = res.body.data.id;
        cy.request('DELETE', `${API}/${id}`).then(del => {
          expect(del.status).to.eq(200);
          expect(del.body.success).to.be.true;
        });

        // Confirmar que foi removida
        cy.request({ url: `${API}/${id}`, failOnStatusCode: false }).then(get => {
          expect(get.status).to.eq(404);
        });
      });
    });

    it('deve retornar 404 ao excluir ID inexistente', () => {
      cy.request({ method: 'DELETE', url: `${API}/nao-existe`, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(404);
      });
    });
  });

  // ── DELETE /api/todos ─────────────────────────────
  describe('DELETE /api/todos (limpar tudo)', () => {
    it('deve remover todas as tarefas', () => {
      cy.request('POST', API, { title: 'T1' });
      cy.request('POST', API, { title: 'T2' });
      cy.request('DELETE', API);

      cy.request(API).then(res => {
        expect(res.body.data).to.have.length(0);
      });
    });
  });

  // ── Content-Type ──────────────────────────────────
  describe('Headers e Formato', () => {
    it('deve responder com Content-Type JSON', () => {
      cy.request(API).then(res => {
        expect(res.headers['content-type']).to.include('application/json');
      });
    });
  });
});
