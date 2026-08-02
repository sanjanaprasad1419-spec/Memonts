import React from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { PartyPopper, Sparkles, Gift, Heart } from 'lucide-react';

interface BirthdayCelebrationViewProps {
  onBack: () => void;
}

export const BirthdayCelebrationView: React.FC<BirthdayCelebrationViewProps> = ({ onBack }) => {
  return (
    <PageContainer maxWidth="4xl">
      <BackButton onClick={onBack} label="Back to Hub" />

      <div className="space-y-8 animate-fadeIn text-center">
        <SectionHeader
          badge="Main Surprise"
          title="30th Birthday Celebration"
          subtitle="The celebration begins in the next phase."
        />

        {/* Centered Illustration Placeholder */}
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-28 h-28 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center relative z-10 shadow-inner">
              <PartyPopper className="w-14 h-14 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Surprise Stage Locked</span>
            </div>
            <h3 className="text-xl font-bold text-slate-200">
              Interactive Stage Under Preparation
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Full interactive birthday animations, cake cutting, floating memory balloons, and confetti surprises will unlock in Phase 4.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-slate-500 text-xs pt-2">
            <span className="flex items-center gap-1">
              <Gift className="w-4 h-4 text-rose-400" /> Special Gift Ready
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-400" /> Made With Love
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
