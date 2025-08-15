import { cn } from '@/lib/utils';

interface RacingBibProps {
  number: number | string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Racing bib component that mimics the appearance of an actual racing bib/dosar.
 * Designed to display athlete bib numbers in a clean, athletic aesthetic.
 */
export function RacingBib({ number, size = 'md', className }: RacingBibProps) {
  if (!number) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground border border-dashed rounded-sm',
          {
            'h-8 w-12 text-xs': size === 'sm',
            'h-10 w-16 text-sm': size === 'md',
            'h-12 w-20 text-base': size === 'lg',
          },
          className,
        )}
      >
        <span className="text-xs opacity-60">--</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold border rounded-sm shadow-sm transition-colors',
        // Base styling
        'bg-white text-slate-900 border-slate-300',
        // Size variants
        {
          'h-8 w-12 text-xs': size === 'sm',
          'h-10 w-16 text-sm': size === 'md',
          'h-12 w-20 text-base': size === 'lg',
        },
        className,
      )}
      role="img"
      aria-label={`Racing bib number ${number}`}
    >
      <span className="font-mono tracking-tight">{number}</span>
    </div>
  );
}
