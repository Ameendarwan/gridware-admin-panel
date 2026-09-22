Feature: Login and Navbar

@smoke @navbar
  Scenario: User logs in and sees navbar
    # Given the user opens the site
    When the user logs in
    Then the navbar should be visible
    When the user navigates to "Deployments" and the navbar should be visible
    When the user views the deployment "TVal-0010" if it exists
    When the user adds a new deployment with:
      | Deployment Name  | Location     | JSON File Path   | Customer Name   | Username    |
      | <deploymentName> | <location>   | <jsonFilePath>   | <customerName>  | <userName>  |

    Examples:
      | deploymentName | location  | jsonFilePath                     | customerName    |  userName      |
      | TVal-0010      | Bedford   | data/01_DST_Import_05Poles.json  | CUST-LARRY      | ashar.ijaz     |