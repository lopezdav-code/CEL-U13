describe('Profile & Password Change', () => {
    const email = Cypress.env('TEST_EMAIL')
    const password = Cypress.env('TEST_PASSWORD')
    const newPassword = 'NewTestPassword123!'

    beforeEach(() => {
        if (!email || !password) {
            cy.log('Skipping test - credentials not configured')
            return
        }
        cy.login(email, password)
    })

    it('should access profile page from user menu', () => {
        if (!email || !password) return

        // Open user menu
        cy.get('header button .h-9.w-9').click()

        // Click on "Mon profil"
        cy.contains('div[role="menuitem"]', 'Mon profil').click()

        // Should be on profile page
        cy.url().should('include', '/profile')

        // Verify profile page elements
        cy.contains('h1', 'Mon Profil').should('be.visible')
        cy.contains('Informations du compte').should('be.visible')
        cy.contains('Changer le mot de passe').should('be.visible')
    })

    it('should display user information correctly', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Verify user information is displayed
        cy.contains('Adresse email').should('be.visible')
        cy.contains(email).should('be.visible')
        cy.contains('Rôle').should('be.visible')
        cy.contains('Statut du compte').should('be.visible')
        cy.contains('Actif').should('be.visible')
    })

    it('should show validation errors for empty password change form', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Try to submit empty form
        cy.contains('button', 'Changer le mot de passe').click()

        // Should show validation errors
        cy.contains('Le mot de passe actuel est requis', { timeout: 2000 }).should('be.visible')
        cy.contains('Le nouveau mot de passe est requis', { timeout: 2000 }).should('be.visible')
        cy.contains('La confirmation est requise', { timeout: 2000 }).should('be.visible')
    })

    it('should show error for incorrect current password', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Fill form with incorrect current password
        cy.get('input#currentPassword').type('WrongPassword123')
        cy.get('input#newPassword').type(newPassword)
        cy.get('input#confirmPassword').type(newPassword)

        // Submit form
        cy.contains('button', 'Changer le mot de passe').click()

        // Should show error message in toast (wait longer for API call)
        cy.contains('Mot de passe incorrect', { timeout: 10000 }).should('be.visible')
    })

    it('should show error when passwords do not match', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Fill form with non-matching passwords
        cy.get('input#currentPassword').type(password)
        cy.get('input#newPassword').type(newPassword)
        cy.get('input#confirmPassword').type('DifferentPassword123')

        // Submit form
        cy.contains('button', 'Changer le mot de passe').click()

        // Should show validation error
        cy.contains('Les mots de passe ne correspondent pas', { timeout: 2000 }).should('be.visible')
    })

    it('should show error for password too short', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Fill form with short password
        cy.get('input#currentPassword').type(password)
        cy.get('input#newPassword').type('12345')
        cy.get('input#confirmPassword').type('12345')

        // Submit form
        cy.contains('button', 'Changer le mot de passe').click()

        // Should show validation error
        cy.contains('Le mot de passe doit contenir au moins 6 caractères', { timeout: 2000 }).should('be.visible')
    })

    it('should successfully change password and login with new password', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Change password
        cy.get('input#currentPassword').type(password)
        cy.get('input#newPassword').type(newPassword)
        cy.get('input#confirmPassword').type(newPassword)

        // Submit form
        cy.contains('button', 'Changer le mot de passe').click()

        // Should show success message (wait for API call)
        cy.contains('Mot de passe modifié', { timeout: 10000 }).should('be.visible')

        // Wait a bit for form reset
        cy.wait(1000)

        // Form should be reset
        cy.get('input#currentPassword').should('have.value', '')
        cy.get('input#newPassword').should('have.value', '')
        cy.get('input#confirmPassword').should('have.value', '')

        // Logout
        cy.get('header button .h-9.w-9').click()
        cy.contains('div[role="menuitem"]', 'Déconnexion').click()

        // Try to login with old password - should fail
        cy.visit('/login')
        cy.get('input[name="identifier"]').type(email)
        cy.get('input[name="password"]').type(password)
        cy.contains('button', 'Se connecter').click()

        // Wait for error toast
        cy.contains('La connexion a échoué', { timeout: 10000 }).should('be.visible')

        // Login with new password - should succeed
        cy.get('input[name="identifier"]').clear().type(email)
        cy.get('input[name="password"]').clear().type(newPassword)
        cy.contains('button', 'Se connecter').click()

        // Should be logged in
        cy.url({ timeout: 10000 }).should('not.include', '/login')
        cy.get('header button .h-9.w-9', { timeout: 5000 }).should('exist')

        // Change password back to original
        cy.visit('/profile')
        cy.get('input#currentPassword').type(newPassword)
        cy.get('input#newPassword').type(password)
        cy.get('input#confirmPassword').type(password)
        cy.contains('button', 'Changer le mot de passe').click()
        cy.contains('Mot de passe modifié', { timeout: 10000 }).should('be.visible')
    })

    it('should maintain session after password change', () => {
        if (!email || !password) return

        cy.visit('/profile')

        // Change password
        cy.get('input#currentPassword').type(password)
        cy.get('input#newPassword').type(newPassword)
        cy.get('input#confirmPassword').type(newPassword)
        cy.contains('button', 'Changer le mot de passe').click()

        // Wait for success message
        cy.contains('Mot de passe modifié', { timeout: 10000 }).should('be.visible')

        // Should still be logged in
        cy.get('header button .h-9.w-9').should('exist')

        // Can navigate to other pages
        cy.visit('/joueuses')
        cy.url().should('include', '/joueuses')

        // Change password back
        cy.visit('/profile')
        cy.get('input#currentPassword').type(newPassword)
        cy.get('input#newPassword').type(password)
        cy.get('input#confirmPassword').type(password)
        cy.contains('button', 'Changer le mot de passe').click()
        cy.contains('Mot de passe modifié', { timeout: 10000 }).should('be.visible')
    })
})
