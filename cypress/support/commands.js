// ***********************************************
// cypress/support/commands.js
// ***********************************************

// Comando customizado para criar uma tarefa via API
Cypress.Commands.add('createTodo', (title, description = '') => {
  return cy.request('POST', '/api/todos', { title, description }).then(res => res.body.data);
});

// Comando para limpar todas as tarefas
Cypress.Commands.add('clearTodos', () => {
  return cy.request('DELETE', '/api/todos');
});
