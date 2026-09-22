import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook that detects if the current viewport width is smaller than the specified mobile breakpoint.
 * - Sets the initial state of `isMobile` to `undefined` to signify the state hasn't been determined yet.
 * - Uses `window.matchMedia` to check if the screen width is below the `MOBILE_BREAKPOINT` value (768px).
 * - Listens for changes to the viewport size using the `change` event and updates the `isMobile` state accordingly.
 * - Returns `true` if the screen width is less than the `MOBILE_BREAKPOINT`, and `false` otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Create a media query listener to detect when the screen size changes
    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Callback function to update the `isMobile` state when the viewport size changes
    const onChange = () => {
      setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add the event listener to detect screen size changes
    mql.addEventListener('change', onChange);

    // Set the initial state based on the current screen size
    setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);

    // Clean up the event listener on component unmount
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile; // Return the boolean value representing mobile state
}
