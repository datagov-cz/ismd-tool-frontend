export const scrollTop = () => {
  if (window) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
