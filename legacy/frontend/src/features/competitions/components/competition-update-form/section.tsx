import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ id, title, description, icon, children }: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get('section');
    if (section === id && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams, id]);

  return (
    <div ref={sectionRef} id={id} className="scroll-mt-24 space-y-4 rounded-lg border p-6">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 text-primary">{icon}</div>}
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
