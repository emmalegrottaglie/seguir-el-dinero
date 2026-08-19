export interface BlueskyPost {
  text: string;
  createdAt: string;
  url: string;
  likes: number;
  reposts: number;
  replies: number;
  isRepost: boolean;
}

interface FeedItem {
  post: {
    uri: string;
    author: { handle: string };
    record: { text?: string; createdAt?: string };
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
  };
  reason?: { $type?: string };
}

// Fetch a Bluesky author's recent posts via the public AppView (no auth, no key).
export async function fetchAuthorFeed(actor: string, limit = 6): Promise<BlueskyPost[]> {
  const url =
    "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=" +
    encodeURIComponent(actor) +
    `&limit=${limit}&filter=posts_no_replies`;

  const res = await fetch(url, { next: { revalidate: 900 } }); // 15 min
  if (!res.ok) return [];

  const data = (await res.json()) as { feed?: FeedItem[] };
  return (data.feed ?? []).map((item) => {
    const p = item.post;
    const rkey = p.uri.split("/").pop() ?? "";
    return {
      text: p.record.text ?? "",
      createdAt: p.record.createdAt ?? "",
      url: `https://bsky.app/profile/${p.author.handle}/post/${rkey}`,
      likes: p.likeCount ?? 0,
      reposts: p.repostCount ?? 0,
      replies: p.replyCount ?? 0,
      isRepost: item.reason?.$type?.includes("Repost") ?? false,
    };
  });
}
