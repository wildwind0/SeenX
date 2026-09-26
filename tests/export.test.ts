import { describe, it, expect } from 'vitest';
import { postToMarkdown } from '../src/utils/export';
import { Post } from '../src/types';

describe('Markdown Export', () => {
  it('formats post to markdown correctly', () => {
    const post: Post = {
      id: '123',
      url: 'https://x.com/test/status/123',
      author: { id: 'u1', name: 'Tester', screenName: 'test', avatarUrl: '' },
      text: 'Testing markdown export output.',
      postType: 'standard',
      media: [],
      firstSeenAt: 1774500000000,
      lastSeenAt: 1774500000000,
      seenCount: 1,
      engaged: false,
      starred: true,
    };

    const md = postToMarkdown(post);
    expect(md).toContain('## [Post by Tester (@test)](https://x.com/test/status/123)');
    expect(md).toContain('Testing markdown export output.');
    expect(md).toContain('**作者**: Tester');
  });
});
