describe('Player Management', () => {
    beforeEach(() => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) {
            throw new Error('Test credentials not configured')
        }

        cy.login(email, password)
        cy.wait(1000) // Wait for auth to settle
    })

    it('should display the list of players', () => {
        cy.visit('/joueuses')

        // Check page title or header
        cy.get('h1').should('contain', 'Joueuses')

        // Check that at least one player card/row exists
        // Adjust selector based on actual UI implementation
        cy.get('.grid > div, table tr').should('have.length.at.least', 1)
    })

    it('should navigate to player details', () => {
        cy.visit('/joueuses')

        // Click on the first player
        cy.get('.grid > div a, table tr a').first().click()

        // URL should contain player ID
        cy.url().should('include', '/joueuses/')

        // Should show player details
        cy.get('h1').should('be.visible')

        // Verify player info is displayed
        cy.get('h1').invoke('text').should('not.be.empty') // Name
        cy.contains('Poste').should('be.visible')

        // Verify stats are present (assuming a stats section or similar)
        // Adjust selectors based on actual UI
        cy.get('.grid').should('exist') // Stats grid
    })
})
