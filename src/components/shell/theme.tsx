"use client";

import { useEffect } from "react";
import { useBank } from "@/lib/store";

/** Runs before paint so a dark-mode reload never flashes white. */
export const themeBootScript = `(function(){try{var r=localStorage.getItem('auremont-bank'),t='light';if(r){var p=JSON.parse(r);t=(p.state&&p.state.preferences&&p.state.preferences.theme)||'light';}var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

/** Keeps <html data-theme> in step with the stored choice and the OS. */
export function ThemeSync() {
  const theme = useBank((s) => s.preferences.theme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    };
    apply();
    if (theme !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return null;
}
