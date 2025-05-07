import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      // Close mobile menu when switching to desktop
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setMobileMenuOpen(false);
      }
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return {
    isMobile: !!isMobile,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  };
}
