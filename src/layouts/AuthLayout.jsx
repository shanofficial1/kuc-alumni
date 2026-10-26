import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, wide = false }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-10 sm:justify-center">
      <div className="mb-6 flex items-center gap-2 text-navy-900">
        <GraduationCap className="h-8 w-8 text-teal-700" />
        <span className="text-xl font-semibold">Alumni Portal</span>
      </div>
      <div className={`card w-full p-6 shadow-sm sm:p-8 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
