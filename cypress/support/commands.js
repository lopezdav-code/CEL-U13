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
    // Wait for the form to be visible and stable (handling framer-motion animations or hydration)
    cy.wait(500)

    cy.get('#identifier').should('be.visible').clear().type(loginEmail)
    cy.get('#password').should('be.visible').type(loginPassword)
    cy.contains('button', 'Se connecter').should('be.visible').click()

    // Wait for login to complete and redirect (check for avatar)
    // This ensures that when this command finishes, the session is fully established
    cy.get('header button .h-9.w-9', { timeout: 10000 }).should('be.visible')
})
