Feature:Add new device and assert dashboard
    @devices
    Scenario: User logs in, and attemps to create a new device with duplicate id
        # Given the user opens the site
        When the user logs in for devices operations
        Then the navbar should be visible Devices operations
        When the user navigates to Devices page
        Then the user clicks on Add New Device button
        When the user adds info for new device and click save button
        Then the user verifies search field visibility and verifies device presence
        # When the user again click on add new device
        # Then the user adds a new device again