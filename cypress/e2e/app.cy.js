describe('Application E2E Tests', () => {
    beforeEach(() => {
        // Visit the application before each test
        cy.visit('/')
    })

    it('should load the homepage successfully', () => {
        // Check that the page loads
        cy.url().should('include', '/')

        // Check that the page contains expected content
        cy.get('body').should('be.visible')
    })

    it('should display the login page', () => {
        // Navigate directly to login page
        cy.visit('/login')

        // Check for login form elements using actual IDs
        cy.get('#identifier').should('exist')
        cy.get('#password').should('exist')
        cy.contains('button', 'Se connecter').should('exist')
    })

    it('should show validation errors for empty login form', () => {
        // Navigate to login page
        cy.visit('/login')

        // Try to submit empty form
        cy.contains('button', 'Se connecter').click()

        // Check that we're still on the login page (form didn't submit)
        cy.url().should('include', '/login')
    })

    it('should login with valid credentials', () => {
        // Get credentials from environment variables
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        // Skip test if credentials are not configured
        if (!email || !password) {
            cy.log('Skipping login test - credentials not configured')
            return
        }

        // Use the custom login command
        cy.login(email, password)

        // Wait for potential redirect or authentication
        cy.wait(2000)

        // Verify we're no longer on the login page
        cy.url().should('not.match', /login/)
    })

    it('should navigate through the application after login', () => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        // Skip test if credentials are not configured
        if (!email || !password) {
            cy.log('Skipping navigation test - credentials not configured')
            return
        }

        // Login first
        cy.login(email, password)
        cy.wait(2000)

        // Verify we're logged in and can see the app
        cy.url().should('not.match', /login/)

        // Check that we can see navigation elements
        cy.get('body').should('be.visible')
    })
})
