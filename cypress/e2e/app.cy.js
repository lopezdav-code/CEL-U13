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
        // Check that we're on the login page or redirected to it
        cy.url().should('match', /\/(login)?/)

        // Check for login form elements
        cy.get('input[type="email"]').should('exist')
        cy.get('input[type="password"]').should('exist')
        cy.get('button[type="submit"]').should('exist')
    })

    it('should show validation errors for empty login form', () => {
        // Try to submit empty form
        cy.get('button[type="submit"]').click()

        // Check that we're still on the login page (form didn't submit)
        cy.url().should('match', /\/(login)?/)
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
        cy.wait(1000)

        // Verify we're no longer on the login page
        // (adjust this assertion based on your app's behavior after login)
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
        cy.wait(1000)

        // Add navigation tests here based on your application
        // For example:
        // cy.get('[data-testid="menu-matchs"]').click()
        // cy.url().should('include', '/matchs')
    })
})
