Feature: Login and Create Pole


@smoke @pole-creation
  Scenario: User logs in and create UNBLOCKED status pole with GRIDSCOPE device
  # Given the user opens the site
  When the user logs in
  Then the navbar should be visible
  When the user navigates to "Deployments" and the navbar should be visible
  When the user goes to "TVal-0010" deployment map if it exists
  When the user place pole on map
  When the user fills the fields with "UNBLOCKED" status pole and "GRIDSCOPE" device
  Then the icon should have "UNBLOCKED" color