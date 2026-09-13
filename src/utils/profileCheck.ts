export const isProfileComplete = (user: any): boolean => {
  if (!user) return false;
  return (
    !!user.phone &&
    !!user.city &&
    !!user.gender &&
    !!user.dateOfBirth &&
    !!user.firstName &&
    !!user.lastName
  );
};
