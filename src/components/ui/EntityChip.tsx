import { Building2, User, Box, MapPin, Briefcase } from 'lucide-react';
import type { Entity } from '../../lib/types';

const entityConfig: Record<Entity['type'], { icon: typeof Building2; color: string }> = {
  COMPANY:   { icon: Building2,  color: 'text-blue-600 bg-blue-50' },
  PERSON:    { icon: User,       color: 'text-purple-600 bg-purple-50' },
  PRODUCT:   { icon: Box,        color: 'text-teal-600 bg-teal-50' },
  GEOGRAPHY: { icon: MapPin,     color: 'text-emerald-600 bg-emerald-50' },
  SECTOR:    { icon: Briefcase,  color: 'text-amber-600 bg-amber-50' },
};

interface EntityChipProps {
  entity: Entity;
  className?: string;
}

export default function EntityChip({ entity, className = '' }: EntityChipProps) {
  const config = entityConfig[entity.type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${config.color} ${className}`}
      style={{ opacity: Math.max(0.6, entity.confidence) }}
    >
      <Icon className="h-3 w-3" />
      {entity.name}
    </span>
  );
}
