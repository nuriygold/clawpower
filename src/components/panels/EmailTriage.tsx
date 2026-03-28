import { useState } from 'react';
import { FileCheck, Check, X, Pencil, Clock, Download } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchEmailTriageGH, type GHEmailTriageData, type GHTriageItem } from '@/lib/github-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';

const domainColors: Record<string, string> = {
  nuriy: 'bg-amber-50 text-amber-700 border-amber-200',
  wellstar: 'bg-blue-50 text-blue-700 border-blue-200',
  ops: 'bg-slate-100 text-slate-600 border-slate-200',
};

const confidenceColors: Record<string, string> = {
  high: 'bg-success',
  medium: 'bg-warning',
  low: 'bg-destructive',
};

type Decision = {
  type: 'approved' | 'denied' | 'edit' | 'snoozed';
  reason?: string;
  editNotes?: string;
  agent?: string;
};

export function EmailTriage() {
  const { data, isError, dataUpdatedAt } = useQuery<GHEmailTriageData>({
    queryKey: ['email-triage-gh'],
    queryFn: fetchEmailTriageGH,
    refetchInterval: 60000,
  });

  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [activeInput, setActiveInput] = useState<Record<string, string>>({});
  const [inputText, setInputText] = useState<Record<string, string>>({});

  const pending = data?.pending_decisions ?? [];
  const syncLabel = dataUpdatedAt
    ? `Last synced: ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : '';

  const senderCounts = pending.reduce<Record<string, number>>((acc, item) => {
    acc[item.from] = (acc[item.from] || 0) + 1;
    return acc;
  }, {});

  const setDecision = (id: string, decision: Decision) => {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
    setActiveInput((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const exportDecisions = () => {
    const approved = pending.filter((p) => decisions[p.id]?.type === 'approved');
    const denied = pending.filter((p) => decisions[p.id]?.type === 'denied');
    const edits = pending.filter((p) => decisions[p.id]?.type === 'edit');
    const snoozed = pending.filter((p) => decisions[p.id]?.type === 'snoozed');

    const ts = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    let md = `# Executive Decision Log\nGenerated: ${ts}\n\n---\n\n## APPROVED\n\n`;
    approved.forEach((p) => {
      md += `### ${p.subject}\n- **From:** ${p.from}\n- **Proposed Action:** ${p.proposal.action}\n- **Draft:** ${p.proposal.draft_response}\n- **Decision Date:** ${ts}\n\n---\n\n`;
    });
    md += `## DENIED\n\n`;
    denied.forEach((p) => {
      md += `### ${p.subject}\n- **Reason:** ${decisions[p.id]?.reason || 'No reason given'}\n\n---\n\n`;
    });
    md += `## NEEDS EDIT\n\n`;
    edits.forEach((p) => {
      md += `### ${p.subject}\n- **Edit Notes:** ${decisions[p.id]?.editNotes || ''}\n- **Original Draft:** ${p.proposal.draft_response}\n\n---\n\n`;
    });
    if (snoozed.length) {
      md += `## SNOOZED\n\n`;
      snoozed.forEach((p) => {
        md += `### ${p.subject}\n- **From:** ${p.from}\n\n---\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decisions-${format(new Date(), 'yyyy-MM-dd')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const decidedCount = Object.keys(decisions).length;

  return (
    <PanelWrapper
      title="Email Triage"
      icon={<FileCheck className="h-5 w-5 text-primary" />}
      error={isError}
    >
      <div className="flex items-center gap-3 -mt-1 mb-3">
        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
          {pending.length - decidedCount} pending
        </Badge>
        {syncLabel && <span className="text-[10px] text-muted-foreground">{syncLabel}</span>}
      </div>

      <div className="space-y-4">
        {pending.map((item) => {
          const dec = decisions[item.id];
          const threadCount = senderCounts[item.from] || 0;

          if (dec) {
            return (
              <div key={item.id} className="rounded-sm border border-border bg-secondary/50 px-4 py-2 flex items-center gap-3 text-xs">
                <Badge className={
                  dec.type === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  dec.type === 'denied' ? 'bg-red-50 text-destructive border-red-200' :
                  dec.type === 'snoozed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }>
                  {dec.type}
                </Badge>
                <span className="font-medium text-foreground">{item.subject}</span>
                <span className="text-muted-foreground ml-auto">{item.from}</span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => {
                  setDecisions((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
                }}>Undo</Button>
              </div>
            );
          }

          return (
            <TriageCard
              key={item.id}
              item={item}
              threadCount={threadCount}
              activeInputType={activeInput[item.id]}
              inputText={inputText[item.id] || ''}
              onInputTextChange={(t) => setInputText((p) => ({ ...p, [item.id]: t }))}
              onApprove={() => setDecision(item.id, { type: 'approved' })}
              onDeny={() => {
                if (activeInput[item.id] === 'deny') {
                  setDecision(item.id, { type: 'denied', reason: inputText[item.id] || '' });
                } else {
                  setActiveInput((p) => ({ ...p, [item.id]: 'deny' }));
                }
              }}
              onEdit={() => {
                if (activeInput[item.id] === 'edit') {
                  setDecision(item.id, { type: 'edit', editNotes: inputText[item.id] || '' });
                } else {
                  setActiveInput((p) => ({ ...p, [item.id]: 'edit' }));
                }
              }}
              onSnooze={() => setDecision(item.id, { type: 'snoozed' })}
            />
          );
        })}

        {pending.length === 0 && (
          <p className="text-center text-muted-foreground text-xs py-8">No pending triage items</p>
        )}
      </div>

      {decidedCount > 0 && (
        <div className="sticky bottom-0 pt-4 mt-4 border-t border-border bg-background">
          <Button onClick={exportDecisions} className="w-full gap-2">
            <Download className="h-4 w-4" /> Export Decisions ({decidedCount})
          </Button>
        </div>
      )}
    </PanelWrapper>
  );
}

function TriageCard({
  item, threadCount, activeInputType, inputText,
  onInputTextChange, onApprove, onDeny, onEdit, onSnooze,
}: {
  item: GHTriageItem;
  threadCount: number;
  activeInputType?: string;
  inputText: string;
  onInputTextChange: (t: string) => void;
  onApprove: () => void;
  onDeny: () => void;
  onEdit: () => void;
  onSnooze: () => void;
}) {
  const domainKey = item.domain?.toLowerCase() || 'ops';
  return (
    <div className="rounded-sm border border-border bg-card p-4 space-y-3 shadow-sm">
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">{item.from}</span>
        {threadCount > 1 && (
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{threadCount} threads</span>
        )}
        <span className="font-semibold text-foreground text-sm">{item.subject}</span>
        <span className="text-muted-foreground ml-auto text-[10px]">
          {formatDistanceToNow(new Date(item.received_at), { addSuffix: true })}
        </span>
        <Badge className={`text-[10px] ${domainColors[domainKey] || 'bg-muted text-muted-foreground'}`}>
          {item.domain}
        </Badge>
        <span className={`h-2 w-2 rounded-full ${confidenceColors[item.proposal.confidence] || 'bg-muted'}`}
          title={`Confidence: ${item.proposal.confidence}`} />
      </div>

      {/* Two-column body */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Original Email</p>
          <div className="bg-secondary rounded-sm p-2.5 text-xs font-mono text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
            {item.body_snippet}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Adrian's Proposal</p>
          <p className="text-xs font-semibold text-foreground mb-1">{item.proposal.action.replace(/_/g, ' ')}</p>
          <div className="bg-secondary rounded-sm p-2.5 text-xs text-foreground leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
            {item.proposal.draft_response}
          </div>
          <p className="text-[10px] italic text-muted-foreground mt-1.5">{item.proposal.reasoning}</p>
        </div>
      </div>

      {/* Inline input */}
      {activeInputType && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={activeInputType === 'deny' ? 'Reason for denial…' : 'Edit notes…'}
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            className="flex-1 h-8 rounded-sm border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <Button size="sm" className="h-8 text-xs" onClick={activeInputType === 'deny' ? onDeny : onEdit}>
            Submit
          </Button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={onApprove}>
          <Check className="h-3 w-3" /> Approve
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-red-300 hover:bg-red-50" onClick={onDeny}>
          <X className="h-3 w-3" /> Deny
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-amber-700 border-amber-300 hover:bg-amber-50" onClick={onEdit}>
          <Pencil className="h-3 w-3" /> Request Edit
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-muted-foreground border-border hover:bg-secondary" onClick={onSnooze}>
          <Clock className="h-3 w-3" /> Snooze
        </Button>
      </div>
    </div>
  );
}
