Feature: Create, Move and Delete for Surveyor Role

@smoke @span-functionality
  Scenario: User logs in and go to deployments to test edit span
  #Given the user opens site and go to deployment
  When the user logs in
  Then the navbar should be visible
  When the user navigates to "Deployments" and the navbar should be visible
  When the user goes to "TVal-0010" deployment map if it exists and turns on testing mode
  When the user creates span
  Then the span will be created
  When the user deletes created span
  Then the created span will be deleted