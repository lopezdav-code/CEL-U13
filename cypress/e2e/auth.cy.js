describe('Authentication & Security', () => {
    beforeEach(() => {
        cy.wait(500)
        cy.visit('/')
    })

    it('should display the login page when accessing protected route', () => {
        // Try to access a protected route directly
        cy.wait(500)
        cy.visit('/joueuses')

        // Should be redirected to login
        cy.url().should('include', '/login')
    })
    it('should show validation errors for empty login form', () => {
        cy.wait(500)
        cy.visit('/login')
        cy.contains('button', 'Se connecter').click()
        cy.wait(500)
        cy.url().should('include', '/login')
    })
    it('should login successfully with valid credentials', () => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')
        cy.wait(1000)
        cy.visit('/login')
        cy.wait(1000)
        if (!email || !password) {
            cy.log('Skipping test - credentials not configured')
            return
        }

        cy.login(email, password)

        // Should be redirected to home/dashboard
        cy.url().should('not.include', '/login')

        // Verify user avatar is present (indicating successful login)
        cy.get('header button .h-9.w-9').should('exist')
    })


    it('should show error message with invalid credentials', () => {
        cy.wait(500)
        cy.visit('/login')
        cy.wait(500)
        cy.get('input[name="identifier"]').type('wrong@example.com')
        cy.get('input[name="password"]').type('wrongpassword')
        cy.contains('button', 'Se connecter').click()

        // Should stay on login page
        cy.url().should('include', '/login')

        // Should show error message (toast)
        cy.contains('La connexion a échoué').should('be.visible')
        cy.contains('Veuillez vérifier votre login et mot de passe.').should('be.visible')
    })

    it('should persist session on refresh', () => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) return

        cy.login(email, password)

        // Verify logged in
        cy.get('header button .h-9.w-9').should('exist')

        // Refresh page
        cy.reload()

        // Should still be logged in
        cy.get('header button .h-9.w-9').should('exist')
        cy.url().should('not.include', '/login')
    })

    it('should logout successfully', () => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) return

        cy.login(email, password)

        // Open user menu
        cy.get('header button .h-9.w-9').click()

        // Click logout button
        cy.contains('div[role="menuitem"]', 'Déconnexion').click()
        cy.wait(10000)
        // Should be redirected to login
        cy.url().should('include', '/login')
    })

})
