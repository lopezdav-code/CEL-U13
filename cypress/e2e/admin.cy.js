describe('Admin Management', () => {
    beforeEach(() => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) return

        cy.login(email, password)
        cy.wait(1000)
    })

    it('should manage clubs', () => {
        cy.visit('/admin-clubs')
        cy.get('h1').should('contain', 'Gestion des Clubs')

        // Check list exists
        cy.get('table, .grid').should('exist')

        // Test adding a club (optional, might need cleanup)
        cy.contains('button', 'Ajouter').click()
        cy.get('input[name="nom"]').type('Club Test Cypress')
        // cy.contains('button', 'Sauvegarder').click()
        // cy.contains('Club Test Cypress').should('exist')
    })

    it('should display user list', () => {
        cy.visit('/admin-users')
        cy.get('h1').should('contain', 'Gestion des Utilisateurs')

        // Check list exists
        cy.get('table, .grid').should('exist')
    })
})
