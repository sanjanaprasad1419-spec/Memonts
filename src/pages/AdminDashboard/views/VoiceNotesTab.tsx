import React from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { EmptyState } from '../../../components/Admin/EmptyState';
import { Mic } from 'lucide-react';

export const VoiceNotesTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Voice Notes"
        subtitle="Manage audio messages and recorded birthday wishes"
      />

      <EmptyState
        icon={Mic}
        title="No voice notes uploaded."
        description="Record or upload personal voice notes to make the birthday surprise extra personal."
        actionLabel="Upload Voice Note"
        isDisabled={true}
      />
    </div>
  );
};
