export const formatRelativeTime = (date: string): string => {
  const normalizedDate = date.replace(/(\.\d{3})\d*/, '$1');
  const postDate = new Date(normalizedDate);

  if (isNaN(postDate.getTime())) {
    console.error(`Invalid date after normalization: ${normalizedDate} (original: ${date})`);
    return "Invalid date";
  }

  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if(diffDays >= 30){
    return postDate.toLocaleDateString('en-US', {
      year:'numeric',
      month:'long',
      day:'numeric',
    });
  }
  if(diffDays >= 8 && diffDays < 15){
    return "a week ago";
  }
  if(diffDays >= 15 && diffDays < 22){
    return "2 weeks ago";
  }
  if(diffDays >= 22 && diffDays < 30){
    return "3 weeks ago";
  }
  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 2) {
    return "1 minute ago";
  } else if (diffHours < 1) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    if (diffHours === 1) {
      return "An hour ago"
    } else {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }
  } else {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
};