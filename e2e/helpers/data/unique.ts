export const uniqueStamp = (): string => String(Date.now());

export const uniqueEmail = (): string => {
  const stamp = uniqueStamp();
  return `e2e_${stamp}@example.com`;
};
