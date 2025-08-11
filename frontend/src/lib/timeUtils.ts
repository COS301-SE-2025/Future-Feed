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

  console.log(`Input: ${date}, Normalized: ${normalizedDate}, PostDate: ${postDate.toISOString()}`);
  console.log(`Now: ${now.toISOString()}, Diff (seconds): ${diffSeconds}, Diff (minutes): ${diffMinutes}`);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 2) {
    return "1 minute ago";
  } else if (diffHours < 1) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else {
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