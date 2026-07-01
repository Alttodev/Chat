export function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  return (
    today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth()
  );
}

export function isBirthdayClaimedThisYear(birthdayReward) {
  const currentYear = new Date().getFullYear();
  return birthdayReward?.lastClaimedYear === currentYear;
}