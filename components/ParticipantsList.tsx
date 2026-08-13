'use client';

import { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Balances, Participant } from '@/lib/types';

interface ParticipantsListProps {
  participants: Participant[];
  balances: Balances;
  onRemoveParticipant: (id: string) => void;
  onAssignCare: (caregiverId: string, recipientIds: string[]) => void;
  onRemoveOneCareRecipient: (caregiverId: string, recipientId: string) => void;
}

export default function ParticipantsList({
  participants,
  balances,
  onRemoveParticipant,
  onAssignCare,
  onRemoveOneCareRecipient,
}: ParticipantsListProps) {
  const [showCareDropdown, setShowCareDropdown] = useState<string | null>(null);
  const [pendingSelections, setPendingSelections] = useState<string[]>([]);

  const caredByMap: { [id: string]: string } = {};
  participants.forEach((p) => {
    if (p.caresFor) {
      p.caresFor.forEach((recipientId) => {
        caredByMap[recipientId] = p.id;
      });
    }
  });

  const payingUnits = participants.filter((p) => !caredByMap[p.id]).length;

  const getParticipantGroups = () => {
    const processed = new Set<string>();
    const groups: Array<{ caregiver: Participant; careRecipients: Participant[] }> = [];

    participants.forEach((p) => {
      if (processed.has(p.id) || caredByMap[p.id]) return;

      const careRecipients = (p.caresFor || [])
        .map((id) => participants.find((x) => x.id === id))
        .filter(Boolean) as Participant[];

      groups.push({ caregiver: p, careRecipients });
      processed.add(p.id);
      careRecipients.forEach((r) => processed.add(r.id));
    });

    return groups;
  };

  const participantGroups = getParticipantGroups();

  const getAvailableCareTargets = (participantId: string) => {
    if (caredByMap[participantId]) return [];

    return participants.filter(
      (p) =>
        p.id !== participantId &&
        !caredByMap[p.id] &&
        !(p.caresFor?.length) &&
        (balances[p.id] ?? 0) < 0
    );
  };

  const openDropdown = (caregiverId: string) => {
    setShowCareDropdown(caregiverId);
    setPendingSelections([]);
  };

  const closeDropdown = () => {
    setShowCareDropdown(null);
    setPendingSelections([]);
  };

  const toggleSelection = (targetId: string) => {
    setPendingSelections((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]
    );
  };

  const confirmAssignment = (caregiverId: string, existingRecipients: string[]) => {
    if (pendingSelections.length === 0) return;
    onAssignCare(caregiverId, [...existingRecipients, ...pendingSelections]);
    closeDropdown();
  };

  const isAddDisabled = (participantId: string) => {
    if (participants.length < 3) return true;
    if (caredByMap[participantId]) return true;
    if (payingUnits <= 2) return true;
    return getAvailableCareTargets(participantId).length === 0;
  };

  return (
    <section className="md:col-span-4 space-y-6">
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
            const { careRecipients } = group;
            const availableTargets = getAvailableCareTargets(p.id);
            const maxNewSelections = payingUnits - 2;

            return (
              <div key={p.id}>
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
                      <div className="relative">
                        <button
                          onClick={() =>
                            showCareDropdown === p.id ? closeDropdown() : openDropdown(p.id)
                          }
                          disabled={isAddDisabled(p.id)}
                          className={`p-1 transition-colors rounded-lg ${
                            isAddDisabled(p.id)
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'
                          }`}
                          title="Pagar juntos"
                        >
                          <Plus className="w-5 h-5" />
                        </button>

                        {showCareDropdown === p.id && (
                          <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 w-56">
                            <div className="px-3 py-2 border-b border-slate-100">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Pagar juntos con
                              </p>
                            </div>

                            {availableTargets.length > 0 ? (
                              <div className="py-1">
                                {availableTargets.map((target) => {
                                  const isSelected = pendingSelections.includes(target.id);
                                  const wouldViolate =
                                    !isSelected && pendingSelections.length >= maxNewSelections;

                                  return (
                                    <button
                                      key={target.id}
                                      onClick={() => !wouldViolate && toggleSelection(target.id)}
                                      disabled={wouldViolate}
                                      className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm transition-colors ${
                                        wouldViolate
                                          ? 'text-slate-300 cursor-not-allowed'
                                          : isSelected
                                          ? 'bg-indigo-50 text-indigo-700'
                                          : 'hover:bg-slate-50 text-slate-700'
                                      }`}
                                      title={
                                        wouldViolate
                                          ? 'Límite alcanzado: debe quedar al menos 2 grupos'
                                          : undefined
                                      }
                                    >
                                      <div
                                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                                          isSelected
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : wouldViolate
                                            ? 'border-slate-200'
                                            : 'border-slate-300'
                                        }`}
                                      >
                                        {isSelected && (
                                          <Check className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                      <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: target.color }}
                                      >
                                        {target.name.charAt(0).toUpperCase()}
                                      </div>
                                      {target.name}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="px-3 py-2 text-sm text-slate-400">
                                Sin opciones disponibles
                              </div>
                            )}

                            <div className="flex gap-2 p-2 border-t border-slate-100">
                              <button
                                onClick={closeDropdown}
                                className="flex-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() =>
                                  confirmAssignment(
                                    p.id,
                                    careRecipients.map((r) => r.id)
                                  )
                                }
                                disabled={pendingSelections.length === 0}
                                className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                                  pendingSelections.length === 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                              >
                                Confirmar
                                {pendingSelections.length > 0 &&
                                  ` (${pendingSelections.length})`}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveParticipant(p.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {careRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="ml-4 flex items-center justify-between group bg-indigo-100 p-2 rounded-lg border-l-2 border-indigo-400"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: recipient.color }}
                        >
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{recipient.name}</span>
                          <span className="text-xs text-indigo-600">pagan juntos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onRemoveOneCareRecipient(p.id, recipient.id)}
                          className="text-orange-500 hover:text-orange-700 p-1 transition-colors hover:bg-orange-50 rounded-lg"
                          title="Dejar de pagar juntos"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveParticipant(recipient.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
