import Field, { Input, Select } from './Field';
import { useMeta } from '../../context/MetaContext';
import { categoryLabel } from '../../utils/format';
import { COMPANY_REQUIRED_STATUSES } from '../../utils/profile';

const thisYear = new Date().getFullYear();

/** The profile inputs shared by registration, "My profile" and the admin edit dialog. */
export default function ProfileFields({ values, onChange, errors = {} }) {
  const { programs, workingStatuses, categories } = useMeta();
  const set = (e) => onChange(e.target.name, e.target.value);
  const companyRequired = COMPANY_REQUIRED_STATUSES.includes(values.workingStatus);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" name="fullName" error={errors.fullName} required className="sm:col-span-2">
        <Input name="fullName" value={values.fullName} onChange={set} error={errors.fullName} maxLength={100} required autoComplete="name" />
      </Field>

      <div className="grid grid-cols-[6rem_1fr] gap-3 sm:col-span-2">
        <Field label="Country code" name="phoneCountryCode" error={errors.phoneCountryCode} required>
          <Input name="phoneCountryCode" value={values.phoneCountryCode} onChange={set} error={errors.phoneCountryCode} placeholder="+91" inputMode="tel" required />
        </Field>
        <Field label="Phone number" name="phoneNumber" error={errors.phoneNumber} required>
          <Input name="phoneNumber" value={values.phoneNumber} onChange={set} error={errors.phoneNumber} inputMode="tel" autoComplete="tel-national" required />
        </Field>
      </div>

      <Field label="Category" name="category" error={errors.category} required>
        <Select name="category" value={values.category} onChange={set} error={errors.category} placeholder="Select category" options={categories.map((c) => ({ value: c, label: categoryLabel(c) }))} required />
      </Field>
      <Field label="Program" name="program" error={errors.program} required>
        <Select name="program" value={values.program} onChange={set} error={errors.program} placeholder="Select program" options={programs} required />
      </Field>

      <Field label="Academic year start" name="academicYearStart" error={errors.academicYearStart} required>
        <Input type="number" name="academicYearStart" value={values.academicYearStart} onChange={set} error={errors.academicYearStart} min={1970} max={thisYear + 1} placeholder="2018" required />
      </Field>
      <Field label="Academic year end" name="academicYearEnd" error={errors.academicYearEnd} required>
        <Input type="number" name="academicYearEnd" value={values.academicYearEnd} onChange={set} error={errors.academicYearEnd} min={1970} max={thisYear + 1} placeholder="2020" required />
      </Field>

      <Field label="Working status" name="workingStatus" error={errors.workingStatus} required className="sm:col-span-2">
        <Select name="workingStatus" value={values.workingStatus} onChange={set} error={errors.workingStatus} placeholder="Select status" options={workingStatuses} required />
      </Field>

      <Field label="Company" name="companyName" error={errors.companyName} required={companyRequired} hint={companyRequired ? undefined : 'Optional'}>
        <Input name="companyName" value={values.companyName} onChange={set} error={errors.companyName} maxLength={150} required={companyRequired} />
      </Field>
      <Field label="Company website" name="companyWebsite" error={errors.companyWebsite} hint="Optional">
        <Input name="companyWebsite" value={values.companyWebsite} onChange={set} error={errors.companyWebsite} placeholder="acme.example.com" maxLength={300} />
      </Field>
      <Field label="LinkedIn profile" name="linkedinUrl" error={errors.linkedinUrl} hint="Optional" className="sm:col-span-2">
        <Input name="linkedinUrl" value={values.linkedinUrl} onChange={set} error={errors.linkedinUrl} placeholder="linkedin.com/in/your-name" maxLength={300} />
      </Field>
    </div>
  );
}
