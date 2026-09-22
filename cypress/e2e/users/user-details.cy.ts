import { urls } from '@app/routes/urls';
import { verifyToastMessage } from '../../support/cypress.utils';

describe('UserDetails Form', () => {
  beforeEach(() => {
    // Login and visit the user creation page
    cy.loginToAuth0();
    cy.visit(`${Cypress.env('E2E_BASE_URL')}${urls.users.create}`);
  });

  it('should fill and save the form', () => {
    // Intercept successful POST request
    cy.intercept('POST', '**/user', {
      statusCode: 201,
      body: { message: 'User created successfully' },
    }).as('postUser');

    // Fill out the form fields
    cy.getBySel('user-email').type('john.doe@test.com');
    cy.getBySel('user-created-by').type('john_creator');
    cy.getBySel('user-updated-by').type('john_updater');

    // Click the save button
    cy.getBySel('save-btn').click();

    // Wait for the POST request and validate the request payload
    cy.wait('@postUser');

    // Check for success toast message
    verifyToastMessage('User created successfully');
  });

  it('should throw an error when trying to create a user with an existing username', () => {
    // Intercept the POST request to return an error
    cy.intercept('POST', '**/user', {
      statusCode: 500,
      body: { message: 'User with this email already exists' },
    }).as('postUserConflict');

    // Fill out the form fields with an existing username
    cy.getBySel('user-email').type('ali.nasir@remotebase.com');
    cy.getBySel('user-created-by').type('ali_creator');
    cy.getBySel('user-updated-by').type('ali_updater');

    // Click the save button
    cy.getBySel('save-btn').click();

    // Wait for the POST request and validate the request payload
    cy.wait('@postUserConflict');

    // Check for error toast message
    verifyToastMessage('Something went wrong');
  });
});
