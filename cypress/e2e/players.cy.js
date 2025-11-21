describe('Player Management', () => {
    beforeEach(() => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) {
            throw new Error('Test credentials not configured')
        }

        cy.session(email, () => {
            cy.login(email, password)
        }, {
            validate: () => {
                cy.getAllLocalStorage().then((ls) => {
                    const hasData = Object.keys(ls).some(origin => {
                        return ls[origin] && Object.keys(ls[origin]).length > 0
                    })
                    if (!hasData) {
                        throw new Error('No session data found')
                    }
                })
            }
        })
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

        // Verify stats are present
        cy.contains('Matchs joués').should('be.visible')
        cy.contains('Buts marqués').should('be.visible')

        // Verify stats grid exists
        cy.get('.grid').should('exist')
    })
})
