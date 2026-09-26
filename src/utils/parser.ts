import { Author, MediaItem, Post, PostType, QuotedPost, ArticleRichContent } from '../types';

export function parseTweetObject(tweetRaw: any, isPromotedOverride?: boolean): Post | null {
  if (!tweetRaw) return null;

  // Unpack TweetWithVisibilityResults
  let tweet = tweetRaw;
  if (tweet.__typename === 'TweetWithVisibilityResults' && tweet.tweet) {
    tweet = tweet.tweet;
  }

  // If this is a Retweet container, unpack the original retweeted tweet
  const retweetedTweet = tweet.legacy?.retweeted_status_result?.result;
  if (retweetedTweet) {
    if (retweetedTweet.__typename === 'TweetWithVisibilityResults' && retweetedTweet.tweet) {
      tweet = retweetedTweet.tweet;
    } else {
      tweet = retweetedTweet;
    }
  }

  const restId = tweet.rest_id || tweet.id_str;
  if (!restId) return null;

  const userResult = tweet.core?.user_results?.result;
  const userLegacy = userResult?.legacy || userResult?.core || {};
  const tweetLegacy = tweet.legacy || {};

  // Check if promoted
  const isPromoted = Boolean(
    isPromotedOverride ||
    tweet.promoted_metadata ||
    tweetRaw.promotedMetadata ||
    tweetRaw.promoted_metadata
  );

  // Author extraction
  const screenName = userLegacy.screen_name || tweet.core?.user_results?.result?.screen_name || 'unknown';
  const name = userLegacy.name || tweet.core?.user_results?.result?.name || screenName;
  
  let rawAvatar = 
    userLegacy.profile_image_url_https ||
    userLegacy.profile_image_url ||
    userResult?.avatar?.image_url ||
    userResult?.avatar?.image_url?.url ||
    userResult?.profile_image_url_https ||
    userResult?.avatar_image_url ||
    '';

  let avatarUrl = rawAvatar.trim();
  if (avatarUrl.startsWith('//')) {
    avatarUrl = 'https:' + avatarUrl;
  }
  // Safely upgrade _normal to _bigger (73x73) for crisp display without breaking URL
  if (avatarUrl.includes('_normal')) {
    avatarUrl = avatarUrl.replace(/_normal(?=\.[a-zA-Z0-9]+)/i, '_bigger');
  }

  const author: Author = {
    id: userResult?.rest_id || tweet.core?.user_results?.result?.id || '',
    name,
    screenName,
    avatarUrl,
    verified: Boolean(userResult?.is_blue_verified || userLegacy.verified),
  };

  // Full text extraction: prefer Note Tweet (untruncated long tweet)
  let text = tweet.note_tweet?.note_tweet_results?.result?.text || tweetLegacy.full_text || tweet.text || '';
  // Clean trailing t.co link to self-media if present
  text = text.replace(/https:\/\/t\.co\/[a-zA-Z0-9]+$/g, '').trim();

  // Media extraction
  const mediaList: MediaItem[] = [];
  const rawMedia = tweetLegacy.extended_entities?.media || tweetLegacy.entities?.media || [];

  for (const m of rawMedia) {
    if (m.type === 'video' || m.type === 'animated_gif') {
      let bestVideoUrl = '';
      let highestBitrate = -1;
      const variants = m.video_info?.variants || [];
      for (const v of variants) {
        if (v.content_type === 'video/mp4' && (v.bitrate || 0) >= highestBitrate) {
          highestBitrate = v.bitrate || 0;
          bestVideoUrl = v.url;
        }
      }
      mediaList.push({
        type: m.type === 'animated_gif' ? 'gif' : 'video',
        url: m.media_url_https || m.url,
        previewUrl: m.media_url_https,
        videoUrl: bestVideoUrl || variants[0]?.url,
        durationMs: m.video_info?.duration_millis,
        width: m.original_info?.width,
        height: m.original_info?.height,
      });
    } else if (m.type === 'photo') {
      mediaList.push({
        type: 'image',
        url: m.media_url_https || m.url,
        previewUrl: m.media_url_https,
        width: m.original_info?.width,
        height: m.original_info?.height,
      });
    }
  }

  // Quoted post extraction
  let quotedPost: QuotedPost | undefined;
  const rawQuote = tweet.quoted_status_result?.result;
  if (rawQuote) {
    let quoteTweet = rawQuote;
    if (quoteTweet.__typename === 'TweetWithVisibilityResults' && quoteTweet.tweet) {
      quoteTweet = quoteTweet.tweet;
    }
    const qUser = quoteTweet.core?.user_results?.result?.legacy || {};
    const qLegacy = quoteTweet.legacy || {};
    let qAvatar = qUser.profile_image_url_https || qUser.profile_image_url || '';
    if (qAvatar.startsWith('//')) qAvatar = 'https:' + qAvatar;

    if (quoteTweet.rest_id) {
      quotedPost = {
        id: quoteTweet.rest_id,
        author: {
          id: quoteTweet.core?.user_results?.result?.rest_id || '',
          name: qUser.name || 'Unknown',
          screenName: qUser.screen_name || 'unknown',
          avatarUrl: qAvatar,
          verified: Boolean(qUser.verified),
        },
        text: (qLegacy.full_text || quoteTweet.text || '').replace(/https:\/\/t\.co\/[a-zA-Z0-9]+$/g, '').trim(),
      };
    }
  }

  // X Article extraction
  let richContent: ArticleRichContent | undefined;
  const articleResult = tweet.article?.article_results?.result || tweet.article;
  if (articleResult) {
    const paragraphs: string[] = [];
    if (Array.isArray(articleResult.blocks)) {
      for (const block of articleResult.blocks) {
        if (block.text) paragraphs.push(block.text);
      }
    } else if (articleResult.plain_text) {
      paragraphs.push(...articleResult.plain_text.split('\n\n').filter(Boolean));
    } else if (text) {
      paragraphs.push(text);
    }

    richContent = {
      title: articleResult.title || 'X Article',
      previewText: articleResult.preview_text || text.slice(0, 150),
      coverImageUrl: articleResult.cover_media?.media_info?.original_img_url || mediaList[0]?.url,
      paragraphs: paragraphs.length > 0 ? paragraphs : [text],
      wordCount: articleResult.word_count || text.split(/\s+/).length,
    };
  } else if (text.length > 500) {
    richContent = {
      title: `${name} 的深度分享`,
      previewText: text.slice(0, 150) + '...',
      paragraphs: text.split('\n\n').filter(Boolean),
      wordCount: text.length,
      coverImageUrl: mediaList[0]?.url,
    };
  }

  // Post Type determination
  let postType: PostType = 'standard';
  if (richContent && (articleResult || text.length > 500)) {
    postType = 'article';
  } else if (mediaList.some(m => m.type === 'video')) {
    postType = 'video';
  } else if (quotedPost) {
    postType = 'quote';
  } else if (tweetLegacy.in_reply_to_status_id_str) {
    postType = 'thread';
  }

  const now = Date.now();

  return {
    id: restId,
    url: `https://x.com/${screenName}/status/${restId}`,
    author,
    text,
    postType,
    media: mediaList,
    quotedPost,
    richContent,
    threadInfo: {
      conversationId: tweetLegacy.conversation_id_str || restId,
      inReplyToStatusId: tweetLegacy.in_reply_to_status_id_str,
    },
    metrics: {
      replyCount: tweetLegacy.reply_count,
      retweetCount: tweetLegacy.retweet_count,
      likeCount: tweetLegacy.favorite_count,
      viewCount: tweet.views?.count ? parseInt(tweet.views.count, 10) : undefined,
    },
    firstSeenAt: now,
    lastSeenAt: now,
    seenCount: 1,
    engaged: false,
    starred: false,
    isPromoted,
  };
}

/**
 * Recursively scans any payload to extract all tweets with deduplication.
 */
export function extractPostsFromPayload(payload: any): Post[] {
  const posts: Post[] = [];
  const visited = new Set<any>();
  const extractedIds = new Set<string>();

  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
    visited.add(obj);

    if (obj.tweet_results && obj.tweet_results.result) {
      const isPromoted = Boolean(obj.promotedMetadata || obj.promoted_metadata);
      const parsed = parseTweetObject(obj.tweet_results.result, isPromoted);
      if (parsed && !extractedIds.has(parsed.id)) {
        extractedIds.add(parsed.id);
        posts.push(parsed);
      }
    } else if (obj.__typename === 'Tweet' || (obj.rest_id && obj.core && obj.legacy)) {
      const parsed = parseTweetObject(obj);
      if (parsed && !extractedIds.has(parsed.id)) {
        extractedIds.add(parsed.id);
        posts.push(parsed);
      }
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        traverse(item);
      }
    } else {
      for (const key of Object.keys(obj)) {
        traverse(obj[key]);
      }
    }
  }

  try {
    traverse(payload);
  } catch (e) {
    console.error('[SeenX] Error parsing payload:', e);
  }

  return posts;
}
