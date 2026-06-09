// src/utils/avatarColor.ts
export function getUserAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  // Fixed: 'hsl' not 'hs', and ensure proper CSS syntax
  return `hsl(${hue}, 70%, 65%)`;
}