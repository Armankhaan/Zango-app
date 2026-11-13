export function isCompanyBranch(branch, companyId) {
  return Boolean(branch?.id) && Number(branch.company_id ?? companyId) === Number(companyId);
}

export function isWithinStoreHours(branch, now = new Date()) {
  if (!branch?.day_start_time || !branch?.day_end_time) return true;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const current = Number(parts.find(part => part.type === 'hour').value) * 60
    + Number(parts.find(part => part.type === 'minute').value);
  const minutes = value => {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  };
  const start = minutes(branch.day_start_time);
  const end = minutes(branch.day_end_time);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return true;
  if (start === end) return true;
  return start < end ? current >= start && current < end : current >= start || current < end;
}
