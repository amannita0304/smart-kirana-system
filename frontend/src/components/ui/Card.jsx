export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
