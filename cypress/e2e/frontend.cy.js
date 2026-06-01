/// <reference types="cypress" />

describe('Frontend - Lista de Tarefas', () => {
  beforeEach(() => {
    // Limpa todas as tarefas antes de cada teste
    cy.request('DELETE', '/api/todos');
    cy.visit('/');
    cy.get('[data-cy="todo-list"]').should('exist');
  });

  describe('Carregamento da página', () => {
    it('deve carregar a página corretamente', () => {
      cy.title().should('include', 'Tarefas');
      cy.get('[data-cy="todo-title-input"]').should('be.visible');
      cy.get('[data-cy="add-todo-btn"]').should('be.visible');
    });

    it('deve exibir estado vazio quando não há tarefas', () => {
      cy.get('[data-cy="todo-item"]').should('not.exist');
    });
  });

  describe('Adicionar tarefa', () => {
    it('deve adicionar uma nova tarefa com título', () => {
      cy.get('[data-cy="todo-title-input"]').type('Comprar pão');
      cy.get('[data-cy="add-todo-btn"]').click();

      cy.get('[data-cy="todo-item"]').should('have.length', 1);
      cy.get('[data-cy="todo-title"]').should('contain', 'Comprar pão');
    });

    it('deve adicionar tarefa com título e descrição', () => {
      cy.get('[data-cy="todo-title-input"]').type('Estudar Cypress');
      cy.get('[data-cy="todo-desc-input"]').type('Aprender testes E2E');
      cy.get('[data-cy="add-todo-btn"]').click();

      cy.get('[data-cy="todo-title"]').should('contain', 'Estudar Cypress');
      cy.get('[data-cy="todo-desc"]').should('contain', 'Aprender testes E2E');
    });

    it('deve adicionar tarefa pressionando Enter no título', () => {
      cy.get('[data-cy="todo-title-input"]').type('Tarefa via Enter{enter}');
      cy.get('[data-cy="todo-item"]').should('have.length', 1);
    });

    it('não deve adicionar tarefa sem título', () => {
      cy.get('[data-cy="add-todo-btn"]').click();
      cy.get('[data-cy="todo-item"]').should('not.exist');
    });

    it('deve limpar os campos após adicionar', () => {
      cy.get('[data-cy="todo-title-input"]').type('Nova tarefa');
      cy.get('[data-cy="todo-desc-input"]').type('Descrição');
      cy.get('[data-cy="add-todo-btn"]').click();

      cy.get('[data-cy="todo-title-input"]').should('have.value', '');
      cy.get('[data-cy="todo-desc-input"]').should('have.value', '');
    });

    it('deve adicionar múltiplas tarefas', () => {
      const tarefas = ['Tarefa 1', 'Tarefa 2', 'Tarefa 3'];
      tarefas.forEach(t => {
        cy.get('[data-cy="todo-title-input"]').type(t);
        cy.get('[data-cy="add-todo-btn"]').click();
      });
      cy.get('[data-cy="todo-item"]').should('have.length', 3);
    });
  });

  describe('Completar tarefa', () => {
    beforeEach(() => {
      cy.get('[data-cy="todo-title-input"]').type('Tarefa para completar');
      cy.get('[data-cy="add-todo-btn"]').click();
      cy.get('[data-cy="todo-item"]').should('have.length', 1);
    });

    it('deve marcar tarefa como concluída', () => {
      cy.get('[data-cy="todo-checkbox"]').first().check();
      cy.get('[data-cy="todo-item"]').first().should('have.class', 'completed');
    });

    it('deve desmarcar tarefa concluída', () => {
      cy.get('[data-cy="todo-checkbox"]').first().check();
      cy.get('[data-cy="todo-checkbox"]').first().uncheck();
      cy.get('[data-cy="todo-item"]').first().should('not.have.class', 'completed');
    });
  });

  describe('Editar tarefa', () => {
    beforeEach(() => {
      cy.get('[data-cy="todo-title-input"]').type('Tarefa original');
      cy.get('[data-cy="add-todo-btn"]').click();
      cy.get('[data-cy="todo-item"]').should('have.length', 1);
    });

    it('deve abrir o modal de edição', () => {
      cy.get('[data-cy="edit-btn"]').first().click();
      cy.get('[data-cy="edit-modal"]').should('have.class', 'open');
    });

    it('deve fechar o modal ao cancelar', () => {
      cy.get('[data-cy="edit-btn"]').first().click();
      cy.get('[data-cy="cancel-edit-btn"]').click();
      cy.get('[data-cy="edit-modal"]').should('not.have.class', 'open');
    });

    it('deve salvar a edição do título', () => {
      cy.get('[data-cy="edit-btn"]').first().click();
      cy.get('[data-cy="edit-title-input"]').clear().type('Tarefa editada');
      cy.get('[data-cy="save-edit-btn"]').click();

      cy.get('[data-cy="todo-title"]').should('contain', 'Tarefa editada');
      cy.get('[data-cy="edit-modal"]').should('not.have.class', 'open');
    });

    it('deve preencher o modal com os dados existentes', () => {
      cy.get('[data-cy="edit-btn"]').first().click();
      cy.get('[data-cy="edit-title-input"]').should('have.value', 'Tarefa original');
    });
  });

  describe('Excluir tarefa', () => {
    beforeEach(() => {
      cy.get('[data-cy="todo-title-input"]').type('Tarefa para excluir');
      cy.get('[data-cy="add-todo-btn"]').click();
      cy.get('[data-cy="todo-item"]').should('have.length', 1);
    });

    it('deve excluir uma tarefa', () => {
      cy.get('[data-cy="delete-btn"]').first().click();
      cy.get('[data-cy="todo-item"]').should('not.exist');
    });
  });

  describe('Filtros', () => {
    beforeEach(() => {
  cy.get('[data-cy="todo-title-input"]').type('Tarefa concluída'); // adicionada 1ª → vai pro topo depois empurrada pra baixo
  cy.get('[data-cy="add-todo-btn"]').click();
  cy.get('[data-cy="todo-title-input"]').type('Tarefa pendente');  // adicionada 2ª → fica no topo
  cy.get('[data-cy="add-todo-btn"]').click();
  cy.get('[data-cy="todo-item"]').should('have.length', 2);
  cy.get('[data-cy="todo-checkbox"]').last().check(); // ✅ agora marca "Tarefa concluída" corretamente
});

    it('deve filtrar tarefas pendentes', () => {
      cy.get('[data-cy="filter-pending"]').click();
      cy.get('[data-cy="todo-item"]').should('have.length', 1);
      cy.get('[data-cy="todo-title"]').should('contain', 'Tarefa pendente');
    });

    it('deve filtrar tarefas concluídas', () => {
      cy.get('[data-cy="filter-completed"]').click();
      cy.get('[data-cy="todo-item"]').should('have.length', 1);
      cy.get('[data-cy="todo-title"]').should('contain', 'Tarefa concluída');
    });

    it('deve mostrar todas as tarefas no filtro "Todas"', () => {
      cy.get('[data-cy="filter-pending"]').click();
      cy.get('[data-cy="filter-all"]').click();
      cy.get('[data-cy="todo-item"]').should('have.length', 2);
    });

    it('deve ativar o botão de filtro selecionado', () => {
      cy.get('[data-cy="filter-pending"]').click();
      cy.get('[data-cy="filter-pending"]').should('have.class', 'active');
      cy.get('[data-cy="filter-all"]').should('not.have.class', 'active');
    });
  });

  describe('Estatísticas', () => {
    it('deve atualizar o contador após adicionar tarefas', () => {
      cy.get('[data-cy="todo-title-input"]').type('Tarefa 1');
      cy.get('[data-cy="add-todo-btn"]').click();
      cy.get('#count-all').should('contain', '1 total');
    });

    it('deve atualizar contador de concluídas', () => {
      cy.get('[data-cy="todo-title-input"]').type('Tarefa');
      cy.get('[data-cy="add-todo-btn"]').click();
      cy.get('[data-cy="todo-checkbox"]').check();
      cy.get('#count-done').should('contain', '1 concluída');
    });
  });
});
