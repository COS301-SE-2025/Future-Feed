export const formatRelativeTime = (date: string): string => {
  const postDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "just now" : `${diffMinutes}min ago`;
    }
    return `${diffHours}hr${diffHours === 1 ? '' : 's'} ago`;
  }
  return postDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};