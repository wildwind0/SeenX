import { describe, it, expect } from 'vitest';
import { parseTweetObject, extractPostsFromPayload } from '../src/utils/parser';

describe('X GraphQL Parser', () => {
  it('correctly parses a standard text and image tweet', () => {
    const rawTweet = {
      __typename: 'Tweet',
      rest_id: '1234567890',
      core: {
        user_results: {
          result: {
            rest_id: 'u123',
            is_blue_verified: true,
            legacy: {
              name: 'Alice',
              screen_name: 'alice_ai',
              profile_image_url_https: 'https://pbs.twimg.com/profile_images/1/avatar_normal.jpg',
            },
          },
        },
      },
      legacy: {
        full_text: 'Hello SeenX! Testing browsing history capture.',
        created_at: 'Fri Sep 26 12:00:00 +0000 2026',
        favorite_count: 42,
        reply_count: 5,
        retweet_count: 10,
        extended_entities: {
          media: [
            {
              type: 'photo',
              media_url_https: 'https://pbs.twimg.com/media/test.jpg',
              original_info: { width: 1200, height: 800 },
            },
          ],
        },
      },
    };

    const post = parseTweetObject(rawTweet);
    expect(post).not.toBeNull();
    expect(post?.id).toBe('1234567890');
    expect(post?.author.name).toBe('Alice');
    expect(post?.author.screenName).toBe('alice_ai');
    expect(post?.author.verified).toBe(true);
    expect(post?.author.avatarUrl).toBe('https://pbs.twimg.com/profile_images/1/avatar_bigger.jpg');
    expect(post?.text).toBe('Hello SeenX! Testing browsing history capture.');
    expect(post?.postType).toBe('standard');
    expect(post?.media.length).toBe(1);
    expect(post?.media[0].type).toBe('image');
    expect(post?.metrics?.likeCount).toBe(42);
    expect(post?.isPromoted).toBe(false);
  });

  it('selects highest bitrate video variant and classifies post as video', () => {
    const rawTweet = {
      __typename: 'Tweet',
      rest_id: '99887766',
      core: {
        user_results: {
          result: {
            legacy: { name: 'Bob', screen_name: 'bob_video' },
          },
        },
      },
      legacy: {
        full_text: 'Watch this awesome demo!',
        extended_entities: {
          media: [
            {
              type: 'video',
              media_url_https: 'https://pbs.twimg.com/media/poster.jpg',
              video_info: {
                duration_millis: 45000,
                variants: [
                  { content_type: 'video/mp4', bitrate: 832000, url: 'https://video.twimg.com/720p.mp4' },
                  { content_type: 'video/mp4', bitrate: 2176000, url: 'https://video.twimg.com/1080p.mp4' },
                  { content_type: 'application/x-mpegURL', url: 'https://video.twimg.com/playlist.m3u8' },
                  { content_type: 'video/mp4', bitrate: 256000, url: 'https://video.twimg.com/360p.mp4' },
                ],
              },
            },
          ],
        },
      },
    };

    const post = parseTweetObject(rawTweet);
    expect(post).not.toBeNull();
    expect(post?.postType).toBe('video');
    expect(post?.media.length).toBe(1);
    expect(post?.media[0].type).toBe('video');
    expect(post?.media[0].videoUrl).toBe('https://video.twimg.com/1080p.mp4');
    expect(post?.media[0].durationMs).toBe(45000);
  });

  it('extracts X Article and parses rich content paragraphs', () => {
    const rawTweet = {
      __typename: 'Tweet',
      rest_id: '77665544',
      core: {
        user_results: {
          result: {
            legacy: { name: 'Writer', screen_name: 'writer' },
          },
        },
      },
      legacy: {
        full_text: 'Check out my longform piece.',
      },
      article: {
        article_results: {
          result: {
            title: 'The Future of Local First Software',
            preview_text: 'Local first software is regaining traction...',
            blocks: [
              { text: 'First paragraph discussing local first principles.' },
              { text: 'Second paragraph diving into IndexedDB and privacy.' },
            ],
            word_count: 1200,
          },
        },
      },
    };

    const post = parseTweetObject(rawTweet);
    expect(post).not.toBeNull();
    expect(post?.postType).toBe('article');
    expect(post?.richContent?.title).toBe('The Future of Local First Software');
    expect(post?.richContent?.paragraphs.length).toBe(2);
    expect(post?.richContent?.paragraphs[0]).toBe('First paragraph discussing local first principles.');
  });

  it('detects and flags promoted tweets', () => {
    const rawTweet = {
      __typename: 'Tweet',
      rest_id: '112233',
      promoted_metadata: { impressionId: 'ad_123' },
      core: {
        user_results: {
          result: { legacy: { name: 'Ad Corp', screen_name: 'adcorp' } },
        },
      },
      legacy: {
        full_text: 'Buy this now! 50% discount!',
      },
    };

    const post = parseTweetObject(rawTweet);
    expect(post?.isPromoted).toBe(true);
  });

  it('recursively extracts multiple tweets from nested timeline instructions', () => {
    const payload = {
      data: {
        home: {
          home_timeline_urt: {
            instructions: [
              {
                type: 'TimelineAddEntries',
                entries: [
                  {
                    content: {
                      itemContent: {
                        tweet_results: {
                          result: {
                            rest_id: 'post_1',
                            core: { user_results: { result: { legacy: { name: 'User 1', screen_name: 'u1' } } } },
                            legacy: { full_text: 'Post 1 text' },
                          },
                        },
                      },
                    },
                  },
                  {
                    content: {
                      itemContent: {
                        tweet_results: {
                          result: {
                            rest_id: 'post_2',
                            core: { user_results: { result: { legacy: { name: 'User 2', screen_name: 'u2' } } } },
                            legacy: { full_text: 'Post 2 text' },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    };

    const posts = extractPostsFromPayload(payload);
    expect(posts.length).toBe(2);
    expect(posts[0].id).toBe('post_1');
    expect(posts[1].id).toBe('post_2');
  });
});
