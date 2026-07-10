export const INSTAGRAM_POST_LIMIT = 6;
export const BEHOLD_FEED_ID = import.meta.env.VITE_BEHOLD_FEED_ID?.trim() ?? "";

export interface InstagramPost {
  permalink: string;
  imageUrl: string;
}

interface BeholdSize {
  mediaUrl?: string;
}

interface BeholdPost {
  permalink?: string;
  permalinkUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  sizes?: {
    thumbnail?: BeholdSize;
    medium?: BeholdSize;
    large?: BeholdSize;
    full?: BeholdSize;
  };
}

interface BeholdFeedResponse {
  posts?: BeholdPost[];
}

function pickImageUrl(post: BeholdPost): string | null {
  return (
    post.sizes?.medium?.mediaUrl ||
    post.sizes?.large?.mediaUrl ||
    post.mediaUrl ||
    post.thumbnailUrl ||
    post.sizes?.thumbnail?.mediaUrl ||
    post.sizes?.full?.mediaUrl ||
    null
  );
}

export function normalizeBeholdPosts(data: BeholdFeedResponse): InstagramPost[] {
  if (!Array.isArray(data.posts)) return [];

  return data.posts
    .map((post) => {
      const permalink = post.permalink || post.permalinkUrl;
      const imageUrl = pickImageUrl(post);

      if (!permalink || !imageUrl) return null;

      return { permalink, imageUrl };
    })
    .filter((post): post is InstagramPost => post !== null)
    .slice(0, INSTAGRAM_POST_LIMIT);
}

export async function fetchBeholdInstagramPosts(
  feedId = BEHOLD_FEED_ID
): Promise<InstagramPost[]> {
  if (!feedId) return [];

  const response = await fetch(`https://feeds.behold.so/${feedId}`);
  if (!response.ok) {
    throw new Error(`Behold feed failed (${response.status})`);
  }

  const data = (await response.json()) as BeholdFeedResponse;
  return normalizeBeholdPosts(data);
}
