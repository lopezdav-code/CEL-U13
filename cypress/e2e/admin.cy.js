describe('Admin Management', () => {
    beforeEach(() => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) return

        cy.session(email, () => {
            cy.login(email, password)
        }, {
            validate: () => {
                // Validate session by checking if we have session data in localStorage
                cy.getAllLocalStorage().then((ls) => {
                    // Check if any origin has data (handling about:blank context)
                    const hasData = Object.keys(ls).some(origin => {
                        return ls[origin] && Object.keys(ls[origin]).length > 0
                    })

                    if (!hasData) {
                        throw new Error('No session data found')
                    }
                })
            }
        })

        // Verify authentication succeeded before running tests
        cy.visit('/')
        cy.get('header button .h-9.w-9').should('exist')
    })

    it('should manage clubs', () => {
        cy.visit('/admin-clubs')
        cy.wait(1000)
        cy.get('h1').should('contain', 'Gestion des Clubs')

        // Check list exists
        cy.get('div.grid').should('exist')

        // Test adding a club (optional, might need cleanup)
        cy.contains('button', 'Nouveau Club').click()
        cy.get('input#nom').type('Club Test Cypress')
        // cy.contains('button', 'Enregistrer').click()
        // cy.contains('Club Test Cypress').should('exist')
    })

    it('should display user list', () => {
        cy.visit('/admin-users')
        cy.wait(1000)
        cy.get('h1').should('contain', 'Gestion des Utilisateurs')

        // Check list exists
        cy.get('table, .grid').should('exist')
    })
})
