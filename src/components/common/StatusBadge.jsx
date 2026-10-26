const TONES = {
  approved: 'bg-teal-50 text-teal-800 ring-teal-600/20',
  active: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  rejected: 'bg-red-50 text-red-800 ring-red-600/20',
  suspended: 'bg-red-50 text-red-800 ring-red-600/20',
};

export default function StatusBadge({ value }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[value] || TONES.active}`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}
