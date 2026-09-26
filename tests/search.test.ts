import { describe, it, expect } from 'vitest';
import { SearchEngine } from '../src/search/engine';
import { Post } from '../src/types';

describe('Search Engine (MiniSearch + Multi-language)', () => {
  it('indexes and searches posts in Chinese, English, and usernames', () => {
    const engine = new SearchEngine();

    const samplePosts: Post[] = [
      {
        id: '1',
        url: 'https://x.com/elonmusk/status/1',
        author: { id: 'u1', name: 'Elon Musk', screenName: 'elonmusk', avatarUrl: '' },
        text: 'Starship flight test will happen next week! Mars colony progress.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: '2',
        url: 'https://x.com/sama/status/2',
        author: { id: 'u2', name: 'Sam Altman', screenName: 'sama', avatarUrl: '' },
        text: '人工智能大模型的推理能力突破，计算架构演进迅速。',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: true,
        starred: true,
      },
      {
        id: '3',
        url: 'https://x.com/deepthinker/status/3',
        author: { id: 'u3', name: 'Deep Thinker', screenName: 'deepthinker', avatarUrl: '' },
        text: '深度思考系列',
        postType: 'article',
        richContent: {
          title: '探索浏览器本地持久化存储的最佳实践',
          paragraphs: ['IndexedDB 结合倒排索引能实现秒级查询。'],
        },
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
    ];

    engine.indexPosts(samplePosts);

    // Search English
    const res1 = engine.search('Starship');
    expect(res1).toContain('1');

    // Search Chinese word
    const res2 = engine.search('人工智能');
    expect(res2).toContain('2');

    // Search Chinese single character
    const res2Char = engine.search('型');
    expect(res2Char).toContain('2');

    // Search author handle
    const res3 = engine.search('elonmusk');
    expect(res3).toContain('1');

    // Search Article Title
    const res4 = engine.search('持久化存储');
    expect(res4).toContain('3');

    // Search character inside article title
    const res4Char = engine.search('储');
    expect(res4Char).toContain('3');

    // Remove post
    engine.removePost('1');
    const res5 = engine.search('Starship');
    expect(res5).not.toContain('1');
  });

  it('supports searching across diverse global languages (Japanese, Korean, Arabic, Spanish, French, German, Turkish, Indonesian, Portuguese)', () => {
    const engine = new SearchEngine();

    const multilingualPosts: Post[] = [
      {
        id: 'ja-1',
        url: 'https://x.com/user/1',
        author: { id: 'u_ja', name: '田中太郎', screenName: 'tanaka', avatarUrl: '' },
        text: 'こんにちは世界、東京の天気がとても良いです。猫が好きです。',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'ko-1',
        url: 'https://x.com/user/2',
        author: { id: 'u_ko', name: '김철수', screenName: 'kim', avatarUrl: '' },
        text: '인공지능 모델과 검색 기능 테스트입니다.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'es-1',
        url: 'https://x.com/user/3',
        author: { id: 'u_es', name: 'Carlos', screenName: 'carlos', avatarUrl: '' },
        text: 'Esta es una gran búsqueda de información en español.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'fr-1',
        url: 'https://x.com/user/4',
        author: { id: 'u_fr', name: 'Pierre', screenName: 'pierre', avatarUrl: '' },
        text: 'Un café très délicieux à Paris et déjà vu.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'ar-1',
        url: 'https://x.com/user/5',
        author: { id: 'u_ar', name: 'أحمد', screenName: 'ahmed', avatarUrl: '' },
        text: 'مرحبا بالعالم هذا اختبار رائع للبحث السريع.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'de-1',
        url: 'https://x.com/user/6',
        author: { id: 'u_de', name: 'Hans', screenName: 'hans', avatarUrl: '' },
        text: 'Künstliche Intelligenz und maschinelles Lernen für alle.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'tr-1',
        url: 'https://x.com/user/7',
        author: { id: 'u_tr', name: 'Mehmet', screenName: 'mehmet', avatarUrl: '' },
        text: 'Yapay zeka modelleri ve harika arama fonksiyonu.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'id-1',
        url: 'https://x.com/user/8',
        author: { id: 'u_id', name: 'Budi', screenName: 'budi', avatarUrl: '' },
        text: 'Kecerdasan buatan dan pemrosesan data penelusuran.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
      {
        id: 'pt-1',
        url: 'https://x.com/user/9',
        author: { id: 'u_pt', name: 'João', screenName: 'joao', avatarUrl: '' },
        text: 'Atualização rápida com inteligência artificial e visualização.',
        postType: 'standard',
        media: [],
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        seenCount: 1,
        engaged: false,
        starred: false,
      },
    ];

    engine.indexPosts(multilingualPosts);

    // Japanese: words and single kanji characters
    expect(engine.search('天気')).toContain('ja-1');
    expect(engine.search('猫')).toContain('ja-1');
    expect(engine.search('東京')).toContain('ja-1');
    expect(engine.search('京')).toContain('ja-1');

    // Korean: word and agglutinated stem search
    expect(engine.search('인공지능')).toContain('ko-1');
    expect(engine.search('모델')).toContain('ko-1');
    expect(engine.search('검색')).toContain('ko-1');

    // Spanish: with and without accents
    expect(engine.search('búsqueda')).toContain('es-1');
    expect(engine.search('busqueda')).toContain('es-1');

    // French: with and without accents
    expect(engine.search('café')).toContain('fr-1');
    expect(engine.search('cafe')).toContain('fr-1');
    expect(engine.search('deja')).toContain('fr-1');

    // German: umlaut query tolerance
    expect(engine.search('Intelligenz')).toContain('de-1');
    expect(engine.search('künstliche')).toContain('de-1');
    expect(engine.search('kunstliche')).toContain('de-1');

    // Arabic: RTL search
    expect(engine.search('اختبار')).toContain('ar-1');
    expect(engine.search('للبحث')).toContain('ar-1');

    // Turkish:
    expect(engine.search('modelleri')).toContain('tr-1');
    expect(engine.search('arama')).toContain('tr-1');

    // Indonesian:
    expect(engine.search('kecerdasan')).toContain('id-1');
    expect(engine.search('pemrosesan')).toContain('id-1');

    // Portuguese:
    expect(engine.search('atualização')).toContain('pt-1');
    expect(engine.search('atualizacao')).toContain('pt-1');
  });
});
