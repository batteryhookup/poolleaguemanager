
export const clearAllData = () => {
  localStorage.removeItem('users');
  localStorage.removeItem('leagues');
  localStorage.removeItem('currentUser');
};
