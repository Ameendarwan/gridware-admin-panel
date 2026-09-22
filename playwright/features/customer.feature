Feature:Add new customer and assert dashboard
    @customer
    Scenario: User logs in, adds a new customer, and verifies its presence on the list
        # Given the user opens the site
        When the user logs in for customer operations
        Then the navbar should be visible customer operations
        When the user navigates to "Customers" page
        Then the user clicks on Add New Customer button
        When the user adds info for new customer and click save button
        Then the user verifies that the search field is visible
        When the user enters name of customer
        Then the user verifies that customer is present in the search results