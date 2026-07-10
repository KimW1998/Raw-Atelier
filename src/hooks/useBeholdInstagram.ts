import { useEffect, useState } from "react";
import {
  BEHOLD_FEED_ID,
  fetchBeholdInstagramPosts,
  type InstagramPost,
} from "@/lib/instagram";

export function useBeholdInstagram() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(BEHOLD_FEED_ID));

  useEffect(() => {
    if (!BEHOLD_FEED_ID) return;

    let cancelled = false;

    fetchBeholdInstagramPosts()
      .then((nextPosts) => {
        if (!cancelled) setPosts(nextPosts);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, isLoading, isConfigured: Boolean(BEHOLD_FEED_ID) };
}
