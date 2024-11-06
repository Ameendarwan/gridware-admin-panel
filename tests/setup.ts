// Add support for RTL
import '@testing-library/jest-dom/vitest'

// Add support for the Fetch API
import 'whatwg-fetch'

// Silence the "Could not parse CSS stylesheet" error message which is a known issue when using
// the container query syntax
const originalConsoleError = console.error

console.error = (message, ...optionalParams) => {
  if (message.includes('Could not parse CSS stylesheet')) {
    return
  }
  originalConsoleError(message, ...optionalParams)
}
