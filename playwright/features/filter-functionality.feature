Feature: Apply and test filter functionality

@smoke @filter-functionality
Scenario: User logs in and go to users page to test filter
#Given the user opens site and go to user
When the user logs in
Then the navbar should be visible
When the user navigates to "<section>" and the navbar should be visible
When the user click on the filter button
Then the filters should be visible
When the user apply "<section>" filters individually

  Examples:
    | section  |
    | Bug |
#    | Users    |
#    | Customers    |
#    | Deployments    |
#    | Poles    |
#    | Devices  |
#    | Public info circuit    |
#    | CSV    |
#    | Span(s) |
#    | Batch Tracking |