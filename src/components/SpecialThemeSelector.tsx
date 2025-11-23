import { useSpecialTheme, SPECIAL_THEMES, type SpecialThemeType } from "../hooks/use-special-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function SpecialThemeSelector() {
  const { theme, setTheme } = useSpecialTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="glass-button-sm p-2 flex items-center gap-2"
          title="Changer le thème spécial"
        >
          <span className="text-base">{SPECIAL_THEMES[theme].emoji}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(SPECIAL_THEMES).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key as SpecialThemeType)}
            className={`cursor-pointer ${theme === key ? "bg-accent" : ""}`}
          >
            <span className="mr-2">{value.emoji}</span>
            <span>{value.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
