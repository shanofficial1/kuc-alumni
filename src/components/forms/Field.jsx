/** Label + control + error/hint. `error` is the backend's message for this field path. */
export default function Field({ label, name, error, hint, required, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}{required && <span className="text-red-500" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs text-red-600" role="alert">{error}</p> : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Input({ name, error, className = '', ...props }) {
  return <input id={name} name={name} aria-invalid={!!error} className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />;
}

/** options: array of strings, or { value, label } objects. */
export function Select({ name, error, options = [], placeholder, className = '', ...props }) {
  return (
    <select id={name} name={name} aria-invalid={!!error} className={`input ${error ? 'input-error' : ''} ${className}`} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const { value, label } = typeof o === 'string' ? { value: o, label: o } : o;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  );
}
