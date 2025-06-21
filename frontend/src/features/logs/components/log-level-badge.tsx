import { type LogLevel } from '@repo/core/schemas';
import { AlertCircle, AlertTriangle, Bug, Info, Zap } from 'lucide-react';

const LOG_LEVEL_CONFIG: Record<
  LogLevel,
  {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ComponentType<{ className?: string }>;
    priority: number;
  }
> = {
  error: {
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    icon: AlertTriangle,
    priority: 0,
  },
  warn: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-600',
    icon: AlertCircle,
    priority: 1,
  },
  info: {
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    icon: Info,
    priority: 2,
  },
  http: {
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600',
    icon: Zap,
    priority: 3,
  },
  verbose: {
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    borderColor: 'border-purple-600',
    icon: Info,
    priority: 4,
  },
  debug: {
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    borderColor: 'border-gray-600',
    icon: Bug,
    priority: 5,
  },
  silly: {
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    borderColor: 'border-pink-600',
    icon: Bug,
    priority: 6,
  },
};

interface LogLevelBadgeProps {
  level: LogLevel;
  className?: string;
}

export function LogLevelBadge({ level, className }: LogLevelBadgeProps) {
  const config = LOG_LEVEL_CONFIG[level];
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium w-fit ${
        config.bgColor
      } ${config.textColor} ${config.borderColor} ${className || ''}`}
    >
      <IconComponent className="w-3 h-3" />
      {level.toUpperCase()}
    </div>
  );
}
