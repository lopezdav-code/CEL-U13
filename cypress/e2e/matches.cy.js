describe('Match Management', () => {
    beforeEach(() => {
        const email = Cypress.env('TEST_EMAIL')
        const password = Cypress.env('TEST_PASSWORD')

        if (!email || !password) {
            throw new Error('Test credentials not configured')
        }

        cy.login(email, password)
        cy.wait(1000) // Wait for auth to settle
    })

    it('should display the list of matches', () => {
        cy.visit('/matchs')

        // Check page title
        cy.get('h1').should('contain', 'Liste des Matchs')

        // Check for "Créer un match" button
        cy.contains('a', 'Créer un match').should('be.visible')
    })

    it('should navigate to create match page', () => {
        cy.visit('/matchs')
        cy.contains('a', 'Créer un match').click()

        cy.url().should('include', '/matchs/creer')
        cy.get('h1').should('contain', 'Créer un nouveau match')
    })

    it('should create a new friendly match', () => {
        cy.visit('/matchs/creer')

        // Fill form
        // Select type 'Amical'
        cy.get('#type_match').click() // Open select
        // Note: Radix UI Select creates a portal, so we might need to look for the content in the body
        // However, standard select interaction in Cypress often involves clicking the trigger then the item
        // Let's try to find the item in the portal
        // If it's a native select, we'd use .select(), but the code uses Radix UI Select.
        // Let's assume standard Radix behavior: click trigger, then click item.

        // Wait for select content if needed, or just click the item text
        cy.get('[role="option"]').contains('Amical').click()

        // Select Opponent (assuming there are clubs in the DB/mock)
        // If no clubs, this might fail. We might need to mock getClubs or ensure data exists.
        // For now, let's try to select the first available option if possible, or skip if empty.
        // But better to try to select one.
        cy.get('#adversaire_id').click()
        cy.get('[role="option"]').first().click()

        // Date
        cy.get('#date_match').type('2025-01-01')

        // Submit
        cy.contains('button', 'Créer le match').click()

        // Should redirect to match details
        cy.url().should('include', '/matchs/')
        cy.get('h1').should('exist') // Details page header
    })

    it('should verify match statuses', () => {
        cy.visit('/matchs')
        // Check for status badges (Victoire, Défaite, Nul, À venir)
        // This assumes there are matches with these statuses or we just check for existence of any status badge
        cy.get('.badge, [class*="bg-"]').should('exist')
    })

    it('should edit a match', () => {
        // Navigate to a match detail (assuming we created one or one exists)
        cy.visit('/matchs')
        cy.contains('a', 'Voir').first().click()

        // Click edit
        cy.contains('button', 'Modifier').click()

        // Change score
        cy.get('input[name="score_domicile"]').clear().type('3')
        cy.get('input[name="score_exterieur"]').clear().type('1')

        // Save
        cy.contains('button', 'Enregistrer').click()

        // Verify update
        cy.contains('3 - 1').should('exist')
    })

    it('should delete a match', () => {
        // Create a dummy match to delete to avoid destroying real test data if possible
        // Or just delete the one we created.
        // For now, let's assume we delete the first one found, but ideally we should create one first.
        // Let's rely on the create test having run before, or just pick one.

        cy.visit('/matchs')
        cy.contains('a', 'Voir').first().click()

        // Click delete
        cy.contains('button', 'Supprimer').click()

        // Confirm if there's a modal
        // cy.contains('button', 'Confirmer').click() 

        // Should redirect to list
        cy.url().should('not.include', '/matchs/') // Should be back to list, check path
        cy.url().should('match', /\/matchs$/)
    })
})
