import { Crown, Lock } from "lucide-react";
import { isPremium, PREMIUM_URL } from "../config/freemium";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface PremiumBadgeProps {
  children: React.ReactNode;
  featureName?: string;
  showLock?: boolean;
  className?: string;
}

export function PremiumBadge({ 
  children, 
  featureName,
  showLock = true,
  className = "" 
}: PremiumBadgeProps) {
  const { language } = useLanguage();

  // Si Premium, afficher normalement
  if (isPremium()) {
    return <>{children}</>;
  }

  const tooltipText = language === 'fr' 
    ? `${featureName || 'Cette fonctionnalité'} est réservée à la version Premium`
    : `${featureName || 'This feature'} is Premium only`;

  const handleClick = () => {
    window.open(PREMIUM_URL, '_blank');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`relative cursor-pointer ${className}`}
          onClick={handleClick}
        >
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          {showLock && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Lock className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-xs">{tooltipText}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Composant pour les tabs verrouillées
interface PremiumTabProps {
  value: string;
  label: string;
  className?: string;
}

export function PremiumTabTrigger({ value, label, className = "" }: PremiumTabProps) {
  const { language } = useLanguage();

  if (isPremium()) {
    return null; // Le composant parent gérera le rendu normal
  }

  const tooltipText = language === 'fr' 
    ? 'Fonctionnalité Premium'
    : 'Premium feature';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={`relative flex items-center justify-center gap-1 opacity-50 cursor-not-allowed ${className}`}
          onClick={(e) => {
            e.preventDefault();
            window.open(PREMIUM_URL, '_blank');
          }}
        >
          <Lock className="w-3 h-3 text-amber-500" />
          <span className="text-xs md:text-sm">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-xs">{tooltipText}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
