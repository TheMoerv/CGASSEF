/**
 * @file src/components/layout/AppLayout.tsx
 * @description Defines the main layout structure for the entire application.
 * This component provides a consistent header with navigation links, a main content area
 * for rendering the active page, and a footer. It is used as a "layout route" in `App.tsx`
 * to ensure all pages share the same visual structure and navigation controls.
 * @author Marwin Ahnfeldt
 */

import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import toolIconLight from '@/assets/tool_icon.png';      
import toolIconDark from '@/assets/tool_icon_dark.png'; 

/**
   * The `AppLayout` component renders the persistent UI shell of the application.
   * It contains the header with navigation, the theme toggle button, and the footer.
   * The `<Outlet />` component from `react-router-dom` is used to render the
   * specific page component that matches the current URL.
   *
   * @returns {JSX.Element} The main application layout
   */
export function AppLayout() {
  const { theme, setTheme } = useTheme();

  // Determine the correct icon to display based on the resolved theme (light/dark),
  const resolvedTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : theme;

  const currentToolIcon = resolvedTheme === 'dark' ? toolIconDark : toolIconLight;

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- Application Header --- */}
      {/* The header is sticky to ensure navigation is always accessible. */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between"> 
          {/* Main application logo and title, linking back to the home page. */}
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"> 
            <img
              src={currentToolIcon}
              alt="Tool Icon"
              className="h-7 w-7 sm:h-8 sm:w-8" // Adjust size as needed
            />
            <span> {/* Wrapped text in a span for better control if needed */}
              CGASSEF - AI Sustainability Assessment Tool
            </span>
          </Link>
          {/* --- Primary Navigation --- */}
          {/* This navigation bar provides access to all four core functions of the prototype. */}
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-3"> {/* Adjusted gaps for responsiveness */}
            <Link to="/create">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Enter / Edit AI-related inputs</Button>
            </Link>
            <Link to="/visualize">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Visualize Impact of AI Service </Button>
            </Link>
            <Link to="/compare">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Compare Impacts of AI Services</Button>
            </Link>
            <Link to="/export">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Export Impact Data</Button>
            </Link>
            {/* Theme toggle button to switch between light and dark modes. */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </nav>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      {/*
       * The `Outlet` is a placeholder provided by `react-router-dom`. It dynamically renders
       * the component for the currently active route (e.g., `<HomePage />`, `<CreateServicePage />`).
       */}
      <main className="flex-1"> {/* Pages will have their own container for content padding */}
        <Outlet />
      </main>
      {/* --- Application Footer --- */}
      <footer className="py-6 border-t bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          CGASSEF - AI Sustainability Assessment Tool © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}