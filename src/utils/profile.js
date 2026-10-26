// Shape of the profile fields the backend lets a client write (constants.js PROFILE_FIELDS).
export const COMPANY_REQUIRED_STATUSES = ['Employed', 'Self-employed'];

export const emptyProfile = {
  fullName: '', phoneCountryCode: '+91', phoneNumber: '', category: '', academicYearStart: '', academicYearEnd: '',
  program: '', workingStatus: '', companyName: '', companyWebsite: '', linkedinUrl: '',
};

export const profileFromUser = (u = {}) => ({
  fullName: u.fullName ?? '',
  phoneCountryCode: u.phoneCountryCode ?? '',
  phoneNumber: u.phoneNumber ?? '',
  category: u.category ?? '',
  academicYearStart: u.academicYearStart ?? '',
  academicYearEnd: u.academicYearEnd ?? '',
  program: u.program ?? '',
  workingStatus: u.workingStatus ?? '',
  companyName: u.companyName ?? '',
  companyWebsite: u.companyWebsite ?? '',
  linkedinUrl: u.linkedinUrl ?? '',
});

/** POST /auth/register body: every required field; optional company/links omitted when blank. */
export function buildRegisterPayload(v) {
  const body = {
    fullName: v.fullName.trim(),
    phoneCountryCode: v.phoneCountryCode.trim(),
    phoneNumber: v.phoneNumber.trim(),
    category: v.category,
    academicYearStart: Number(v.academicYearStart),
    academicYearEnd: Number(v.academicYearEnd),
    program: v.program,
    workingStatus: v.workingStatus,
  };
  ['companyName', 'companyWebsite', 'linkedinUrl'].forEach((k) => { if (v[k].trim()) body[k] = v[k].trim(); });
  return body;
}

/**
 * PATCH body containing only what changed. The backend requires phone code+number together and
 * academic year start+end together, and treats "" for the company fields as "clear".
 */
export function buildProfileDiff(initial, current) {
  const changed = (k) => String(initial[k] ?? '').trim() !== String(current[k] ?? '').trim();
  const out = {};
  if (changed('fullName')) out.fullName = current.fullName.trim();
  if (changed('phoneCountryCode') || changed('phoneNumber')) {
    out.phoneCountryCode = current.phoneCountryCode.trim();
    out.phoneNumber = current.phoneNumber.trim();
  }
  if (changed('academicYearStart') || changed('academicYearEnd')) {
    out.academicYearStart = Number(current.academicYearStart);
    out.academicYearEnd = Number(current.academicYearEnd);
  }
  ['category', 'program', 'workingStatus'].forEach((k) => { if (changed(k)) out[k] = current[k]; });
  ['companyName', 'companyWebsite', 'linkedinUrl'].forEach((k) => { if (changed(k)) out[k] = current[k].trim(); });
  return out;
}
