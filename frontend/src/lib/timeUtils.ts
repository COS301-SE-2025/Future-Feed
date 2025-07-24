export const formatRelativeTime = (date: string): string => {
  const normalizedDate = date.replace(/(\.\d{3})\d+/, '$1Z');
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

  if (diffHours < 1) {
    // Within the first hour: show seconds or minutes
    if (diffSeconds < 60) {
      return "just now";
    }

    return `${diffMinutes} minute${diffMinutes === 17 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    // Between 1 and 24 hours: show hours
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else {
    // Older than 24 hours: show full date and time
    return postDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
};