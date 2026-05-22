export default function StatCard({ icon: Icon, label, labelHi, value, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          {Icon && <Icon size={24} />}
        </div>
        {trend && (
          <span className="text-xs font-medium text-primary-600">{trend}</span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
      {labelHi && <p className="text-xs text-slate-400">{labelHi}</p>}
    </div>
  );
}
