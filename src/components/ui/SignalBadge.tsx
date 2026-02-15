import {
  Shield,
  AlertTriangle,
  Bug,
  Lock,
  Wifi,
  Eye,
  Zap,
  Globe,
  Cloud,
  Brain,
  FileText,
  Activity,
  type LucideIcon,
} from 'lucide-react';

interface SignalBadgeProps {
  slug: string;
  name: string;
  confidence?: number;
  className?: string;
}

const signalConfig: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  'vulnerability':        { icon: AlertTriangle, bg: 'bg-red-50',     text: 'text-red-700' },
  'malware':              { icon: Bug,           bg: 'bg-red-50',     text: 'text-red-800' },
  'ransomware':           { icon: Lock,          bg: 'bg-orange-50',  text: 'text-orange-700' },
  'data-breach':          { icon: Shield,        bg: 'bg-orange-50',  text: 'text-orange-800' },
  'phishing':             { icon: Wifi,          bg: 'bg-amber-50',   text: 'text-amber-700' },
  'hacking':              { icon: Zap,           bg: 'bg-red-50',     text: 'text-red-700' },
  'ddos':                 { icon: Activity,      bg: 'bg-rose-50',    text: 'text-rose-700' },
  'insider-threat':       { icon: Eye,           bg: 'bg-purple-50',  text: 'text-purple-700' },
  'supply-chain':         { icon: Globe,         bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  'nation-state':         { icon: Globe,         bg: 'bg-purple-50',  text: 'text-purple-800' },
  'regulatory':           { icon: FileText,      bg: 'bg-blue-50',    text: 'text-blue-700' },
  'patch-update':         { icon: Shield,        bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'threat-intelligence':  { icon: Eye,           bg: 'bg-slate-100',  text: 'text-slate-700' },
  'cloud-security':       { icon: Cloud,         bg: 'bg-sky-50',     text: 'text-sky-700' },
  'ai-security':          { icon: Brain,         bg: 'bg-violet-50',  text: 'text-violet-700' },
  'data-loss':            { icon: AlertTriangle, bg: 'bg-orange-50',  text: 'text-orange-700' },
};

const defaultConfig = { icon: Shield, bg: 'bg-gray-100', text: 'text-text-secondary' };

export default function SignalBadge({ slug, name, confidence, className = '' }: SignalBadgeProps) {
  const config = signalConfig[slug] || defaultConfig;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${className}`}
      style={confidence !== undefined ? { opacity: Math.max(0.5, confidence) } : undefined}
    >
      <Icon className="h-3 w-3" />
      {name}
    </span>
  );
}
