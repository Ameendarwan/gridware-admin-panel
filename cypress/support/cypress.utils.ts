export function verifyToastMessage(expectedMessage: string): void {
  cy.get('.data-sonner-toast', { timeout: 12000 }).should('exist').contains(expectedMessage);
}
