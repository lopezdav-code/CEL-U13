describe('Feature Tests', () => {
    beforeEach(() => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) return

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

    it('should display the photos gallery', () => {
        cy.visit('/photos')
        cy.get('h1').should('contain', 'Photos')
        // Check for images or gallery container
        cy.get('img').should('have.length.at.least', 1)
    })

    it('should display statistics dashboard', () => {
        cy.visit('/statistiques')
        cy.get('h1').should('contain', 'Statistiques')
        // Check for charts or stats cards
        cy.get('.grid, canvas, svg').should('exist')
    })

    it('should allow interaction with the quiz', () => {
        cy.wait(1000)
        cy.visit('/quiz')
        cy.get('h1').should('contain', 'Qui est cette joueuse ?')
        // Check for option buttons
        cy.get('button').should('have.length.at.least', 4)
    })
})
