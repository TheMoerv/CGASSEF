// src/components/layout/AppLayout.tsx
import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import toolIconLight from '@/assets/tool_icon.png';      // Assuming this is your light mode icon
import toolIconDark from '@/assets/tool_icon_dark.png'; // Assuming this is your dark mode icon

export function AppLayout() {
  const { theme, setTheme } = useTheme();

  // Determine which icon to use based on the current theme
  // The 'system' theme will resolve to 'light' or 'dark' based on user's OS preference
  // The ThemeProvider handles adding the 'dark' class to the html element.
  // We can also check the resolved theme if ThemeProvider exposes it, or rely on 'theme' state.
  const resolvedTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : theme;

  const currentToolIcon = resolvedTheme === 'dark' ? toolIconDark : toolIconLight;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* The 'container' class already provides horizontal padding.
            If it's still too close, ensure the container itself isn't constrained to be too wide.
            Or, add padding to the Link itself if needed for very small screens.
        */}
        <div className="container flex h-16 items-center justify-between"> {/* Increased height slightly for icon */}
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"> {/* Added flex, gap, text-lg, tracking, hover effect */}
            <img
              src={currentToolIcon}
              alt="Tool Icon"
              className="h-7 w-7 sm:h-8 sm:w-8" // Adjust size as needed
            />
            <span> {/* Wrapped text in a span for better control if needed */}
              CGASSEF - AI Sustainability Assessment Tool
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-3"> {/* Adjusted gaps for responsiveness */}
            <Link to="/create">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Create/Edit</Button>
            </Link>
            <Link to="/visualize">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Visualize</Button>
            </Link>
            <Link to="/compare">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Compare</Button>
            </Link>
            <Link to="/export">
              <Button variant="ghost" className="px-2 sm:px-3 text-xs sm:text-sm">Export Data</Button>
            </Link>
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
      <main className="flex-1"> {/* Pages will have their own container for content padding */}
        <Outlet />
      </main>
      <footer className="py-6 border-t bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          CGASSEF - AI Sustainability Assessment Tool © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}