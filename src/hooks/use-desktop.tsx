import * as React from "react";

const DESKTOP_BREAKPOINT = 1024;

/** True on laptop/desktop-sized screens (>= 1024px). Mobile & tablet stay false. */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches
      : false
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
