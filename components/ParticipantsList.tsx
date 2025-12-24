'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Participant } from '@/lib/types';

interface ParticipantsListProps {
  participants: Participant[];
  onRemoveParticipant: (id: string) => void;
  onAssignCare: (caregiverId: string, careRecipientId: string) => void;
  onRemoveCare: (caregiverId: string) => void;
}

export default function ParticipantsList({
  participants,
  onRemoveParticipant,
  onAssignCare,
  onRemoveCare,
}: ParticipantsListProps) {
  const [showCareDropdown, setShowCareDropdown] = useState<string | null>(null);

  // Find participants with care relationships
  const caredByMap: { [id: string]: string } = {};
  participants.forEach((p) => {
    if (p.caresFor) {
      caredByMap[p.caresFor] = p.id;
    }
  });

  // Get groups: each group is either (caregiver + care recipient) or solo participant
  const getParticipantGroups = () => {
    const processed = new Set<string>();
    const groups: Array<{ caregiver: Participant; careRecipient?: Participant }> = [];

    participants.forEach((p) => {
      if (processed.has(p.id)) return;

      if (p.caresFor) {
        // This is a caregiver
        const careRecipient = participants.find((x) => x.id === p.caresFor);
        groups.push({ caregiver: p, careRecipient });
        processed.add(p.id);
        if (careRecipient) processed.add(careRecipient.id);
      } else if (!caredByMap[p.id]) {
        // This is a solo participant (not being cared for and not caring for anyone)
        groups.push({ caregiver: p });
        processed.add(p.id);
      }
    });

    return groups;
  };

  const participantGroups = getParticipantGroups();

  // Get available participants for care assignment (not already caring, not already cared for, not the same)
  const getAvailableCareTargets = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant || participant.caresFor) return [];

    return participants.filter(
      (p) =>
        p.id !== participantId &&
        !caredByMap[p.id] && // Not already cared for
        !p.caresFor // Not already caring for someone
    );
  };

  return (
    <section className="md:col-span-4 space-y-6">
      {/* Participants Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span> Participantes ({participants.length})
        </h2>

        <div className="space-y-3">
          {participants.length === 0 && (
            <p className="text-center text-slate-400 py-4 text-sm italic">
              Agrega personas para empezar
            </p>
          )}
          {participantGroups.map((group) => {
            const p = group.caregiver;
            const careRecipient = group.careRecipient;
            return (
              <div key={p.id}>
                {/* Root participant (caregiver) - with care recipient inside */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Care assignment dropdown - only available with 3+ participants */}
                      <div className="relative">
                        <button
                          onClick={() => setShowCareDropdown(showCareDropdown === p.id ? null : p.id)}
                          disabled={participants.length < 3}
                          className={`p-1 transition-colors rounded-lg ${
                            participants.length < 3
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'
                          }`}
                          title="Pagar juntos"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        {showCareDropdown === p.id && (
                          <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-max">
                            {getAvailableCareTargets(p.id).length > 0 ? (
                              getAvailableCareTargets(p.id).map((target) => (
                                <button
                                  key={target.id}
                                  onClick={() => {
                                    onAssignCare(p.id, target.id);
                                    setShowCareDropdown(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                >
                                  {target.name}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-slate-400">
                                Sin opciones
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Remove button - hidden until hover */}
                      <button
                        onClick={() => onRemoveParticipant(p.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Care recipient (nested inside the root participant card) */}
                  {careRecipient && (
                    <div className="ml-4 flex items-center justify-between group bg-indigo-100 p-2 rounded-lg border-l-2 border-indigo-400">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: careRecipient.color }}
                        >
                          {careRecipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{careRecipient.name}</span>
                          <span className="text-xs text-indigo-600">pagan juntos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Unlink button - always visible */}
                        <button
                          onClick={() => onRemoveCare(p.id)}
                          className="text-orange-500 hover:text-orange-700 p-1 transition-colors hover:bg-orange-50 rounded-lg"
                          title="Dejar de cuidar"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        {/* Remove button - hidden until hover */}
                        <button
                          onClick={() => onRemoveParticipant(careRecipient.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
