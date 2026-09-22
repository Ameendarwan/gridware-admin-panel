/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
import { urls } from '@app/routes/urls';

declare global {
  namespace Cypress {
    interface Chainable {
      loginToAuth0(): Chainable<void>;
      getBySel(selector: string, ...args: any): Chainable<JQuery<HTMLElement>>;
      asPersistent(selector: string, ...args: any): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('loginToAuth0', () => {
  cy.session(Cypress.env('AUTH0_USERNAME'), () => {
    cy.visit(Cypress.env('E2E_BASE_URL'));
    cy.get('button[id="login-btn"]').click();
    cy.origin(
      `https://${Cypress.env('AUTH0_DOMAIN')}/`,
      { args: { username: Cypress.env('AUTH0_USERNAME'), password: Cypress.env('AUTH0_PASSWORD') } },
      ({ username, password }) => {
        cy.get('input[id="username"]').type(username);
        cy.get('input[id="password"]').type(password);
        cy.log('About to click Log In...');
        cy.get('button[type="submit"][name="action"][data-action-button-primary="true"]').contains('Continue').click();
      }
    ).then(() => {
      // After clicking the submit button, we expect a redirect to occur.
      // We can use `cy.location` to assert that the URL has changed to the expected callback URL.
      cy.location('pathname', { timeout: 2000 }).should('include', urls.users.list);
    });
  });
});

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args);
});

export {};
