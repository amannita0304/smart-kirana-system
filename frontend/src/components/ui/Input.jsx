export default function Input({
  label,
  labelHi,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {labelHi && <span className="text-slate-400 ml-1">/ {labelHi}</span>}
        </label>
      )}
      <input
        className={`w-full rounded-xl border px-4 py-2.5 text-base outline-none transition focus:ring-2 focus:ring-primary-500/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
