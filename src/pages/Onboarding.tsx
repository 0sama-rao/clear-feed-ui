import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Cpu, DollarSign, Heart, Zap, ChevronRight } from 'lucide-react';
import { getIndustries, submitOnboarding, runDigest } from '../lib/services';
import type { Industry } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const industryIcons: Record<string, typeof Shield> = {
  cybersecurity: Shield,
  technology: Cpu,
  finance: DollarSign,
  healthcare: Heart,
  energy: Zap,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { setOnboarded } = useAuth();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'pick' | 'setting-up'>('pick');
  const [setupMessage, setSetupMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getIndustries();
        setIndustries(data.industries);
      } catch {
        setError('Failed to load industries');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGetStarted() {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    setStep('setting-up');
    setSetupMessage('Setting up your intelligence profile...');

    try {
      const result = await submitOnboarding(selected);
      setSetupMessage(
        `Added ${result.sourcesAdded} sources and ${result.keywordsAdded} keywords for ${result.industry.name}. Running your first digest...`
      );

      // Auto-trigger first digest
      try {
        await runDigest();
        setSetupMessage('Your intelligence feed is ready!');
      } catch {
        // Digest can fail on first run if sources haven't been scraped yet — that's ok
        setSetupMessage('Setup complete! Your feed will populate shortly.');
      }

      setOnboarded(true);

      // Brief pause so user sees the success message
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch {
      setError('Failed to complete onboarding. Please try again.');
      setStep('pick');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    setOnboarded(true);
    navigate('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #edf4fd, #e7ecf3)' }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome to Clearfeed
          </h1>
          <p className="text-text-secondary text-base">
            What field are you in? We'll set up your intelligence feed automatically.
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {step === 'setting-up' ? (
          <div
            className="bg-surface rounded-xl p-12 text-center"
            style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)' }}
          >
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-sm text-text-secondary">{setupMessage}</p>
          </div>
        ) : (
          <>
            {/* Industry cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {industries.map((industry) => {
                const Icon = industryIcons[industry.slug] || Shield;
                const isSelected = selected === industry.slug;

                return (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => setSelected(industry.slug)}
                    className={`bg-surface rounded-xl p-6 text-left transition-all cursor-pointer border-2 ${
                      isSelected
                        ? 'border-primary shadow-md'
                        : 'border-transparent hover:border-primary/20'
                    }`}
                    style={{ boxShadow: isSelected ? undefined : '0 2px 12px rgba(0, 0, 0, 0.06)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary text-white' : 'bg-primary-light text-primary'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-text mb-1">
                          {industry.name}
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {industry.description}
                        </p>
                        <p className="text-xs text-text-secondary/60 mt-2">
                          {industry.signals.length} signal types
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                Skip — I'll set up manually
              </button>
              <Button
                onClick={handleGetStarted}
                disabled={!selected}
                isLoading={submitting}
              >
                Get Started
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
