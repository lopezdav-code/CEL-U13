// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email, password) => {
    // Use provided credentials or fall back to environment variables
    const loginEmail = email || Cypress.env('TEST_EMAIL')
    const loginPassword = password || Cypress.env('TEST_PASSWORD')

    cy.visit('/login')
    cy.get('input[type="email"]').type(loginEmail)
    cy.get('input[type="password"]').type(loginPassword)
    cy.get('button[type="submit"]').click()
})
