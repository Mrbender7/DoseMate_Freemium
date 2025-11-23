import { Palette } from "lucide-react";
import { usePalette, PALETTES, type PaletteType } from "../hooks/use-palette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function PaletteSelector() {
  const { palette, setPalette } = usePalette();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="glass-button-sm p-2 flex items-center gap-2"
          title="Changer la palette de couleurs"
        >
          <span className="text-base">🎨</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(PALETTES).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setPalette(key as PaletteType)}
            className={`cursor-pointer ${palette === key ? "bg-accent" : ""}`}
          >
            <span className="mr-2">{value.emoji}</span>
            <span>{value.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
