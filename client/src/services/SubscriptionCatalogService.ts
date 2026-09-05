export interface SubscriptionPreset {
  id: string;
  name: string;
  category: 'Streaming' | 'Music' | 'AI & Tech' | 'Productivity' | 'Gaming' | 'Fitness' | 'Utilities';
  iconUrl?: string;
  localIconKey?: string;
  color?: string;
}

export const POPULAR_SUBSCRIPTIONS: SubscriptionPreset[] = [
  // E-Commerce & Shopping / Subscriptions
  {
    id: 'shopee_ph',
    name: 'Shopee PH / SPayLater',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bf/97/96/bf97960a-01dc-fa48-6a56-b08e7df0eb63/AppIcon_PH-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#EE4D2D',
  },
  {
    id: 'lazada_ph',
    name: 'Lazada / LazPayLater',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/37/12/37/371237a3-5c74-e818-f291-76082b2aebfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#0F146D',
  },
  {
    id: 'grab_unlimited',
    name: 'GrabUnlimited / GrabPay',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/21/df/b5/21dfb5c1-9ba6-3f19-bdf3-fe7876a3e144/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#00B14F',
  },
  {
    id: 'foodpanda_pro',
    name: 'foodpanda pandapro',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/80/7e/76/807e7616-5654-7389-c439-d50dcf3fca85/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#D70F64',
  },

  // Internet & Telecom / Utilities
  {
    id: 'pldt_wifi',
    name: 'PLDT WiFi / Home Fiber',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/21/53/78/21537829-9e85-b1a1-f3b1-a96cbbfa4ca1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#ED1C24',
  },
  {
    id: 'converge_fiber',
    name: 'Converge ICT Fiber',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/0d/bb/ea/0dbbea14-e0eb-047f-f7d9-c9a9dc898495/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FF6600',
  },
  {
    id: 'globe_fiber',
    name: 'Globe At Home WiFi / GFiber',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/58/01/a8/5801a8ba-9941-ad4e-5e92-f04523c14d9b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#00529B',
  },
  {
    id: 'dito_wifi',
    name: 'DITO Home WiFi',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/44/21/df/4421df6a-ea7b-c3fb-dfbc-fe1feefebf24/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#E60012',
  },
  {
    id: 'meralco',
    name: 'Meralco Electric Bill',
    category: 'Utilities',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/55/e1/9f/55e19f18-6bb7-a69a-6531-15b5976b9117/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FF6600',
  },

  // Streaming & TV
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Streaming',
    localIconKey: 'netflix.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bf/16/be/bf16be70-496a-5544-db46-24f603c5b5aa/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#E50914',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Music',
    localIconKey: 'spotify.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/44/21/df/4421df6a-ea7b-c3fb-dfbc-fe1feefebf24/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#1DB954',
  },
  {
    id: 'disney',
    name: 'Disney+',
    category: 'Streaming',
    localIconKey: 'disney.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/58/01/a8/5801a8ba-9941-ad4e-5e92-f04523c14d9b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#113CCF',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    category: 'Streaming',
    localIconKey: 'prime.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e5/27/b1/e527b134-8c88-1bfd-c073-67c8be0c273e/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#00A8E1',
  },
  {
    id: 'youtube_premium',
    name: 'YouTube Premium',
    category: 'Streaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/55/e1/9f/55e19f18-6bb7-a69a-6531-15b5976b9117/logo_youtube_color-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FF0000',
  },
  {
    id: 'apple_tv',
    name: 'Apple TV+',
    category: 'Streaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/05/cf/43/05cf438a-028c-9c71-c063-2a441399435b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#000000',
  },
  {
    id: 'hbomax',
    name: 'HBO Max',
    category: 'Streaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a4/09/b8/a409b83b-9a29-009d-cb9e-56e632d4b684/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#5822B4',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    category: 'Streaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/80/7e/76/807e7616-5654-7389-c439-d50dcf3fca85/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#F47521',
  },

  // AI & Tech
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    category: 'AI & Tech',
    localIconKey: 'chatgpt.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/31/ca/4f/31ca4f8c-c46a-7965-0a86-7a875bf97d3a/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#10A37F',
  },
  {
    id: 'claude',
    name: 'Claude Pro',
    category: 'AI & Tech',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bb/a2/12/bba21200-a92c-569a-ca2c-e3a5cbca7c79/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#D97757',
  },
  {
    id: 'gemini',
    name: 'Gemini Advanced',
    category: 'AI & Tech',
    localIconKey: 'gemini.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a4/ce/eb/a4ceeb37-c81a-54ea-58b6-ea6541f53139/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#4285F4',
  },
  {
    id: 'capcut',
    name: 'CapCut Pro',
    category: 'AI & Tech',
    localIconKey: 'capcut.png',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/21/53/78/21537829-9e85-b1a1-f3b1-a96cbbfa4ca1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#000000',
  },
  {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    category: 'AI & Tech',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1b/ad/b4/1badb420-9993-9eb6-f48a-6ce470bc5531/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#24292E',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    category: 'AI & Tech',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/64/7d/50/647d507b-cb18-8f83-e070-df172ea255e3/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#1E1F22',
  },

  // Productivity
  {
    id: 'canva',
    name: 'Canva Pro',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/9f/bf/919fbf3a-96e0-2f92-5645-ec7e440b8529/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#00C4CC',
  },
  {
    id: 'notion',
    name: 'Notion Plus',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e5/22/e1/e522e1c9-7ef2-7c87-84ec-15b9c02da8c8/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#000000',
  },
  {
    id: 'figma',
    name: 'Figma Professional',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/05/cf/a6/05cfa69b-86d7-8547-06ad-4569c766b19a/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#F24E1E',
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bf/82/87/bf828775-697a-9721-a3f2-a083321558bf/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#D83B01',
  },
  {
    id: 'google_one',
    name: 'Google One',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b9/69/fb/b969fb23-74d3-488f-4a0b-ae9e27c1f8a8/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#4285F4',
  },
  {
    id: 'icloud',
    name: 'iCloud+ Storage',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bc/26/1e/bc261e47-e117-91fb-5536-1e65d214643c/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#007AFF',
  },
  {
    id: 'adobe_cc',
    name: 'Adobe Creative Cloud',
    category: 'Productivity',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c3/84/ca/c384ca4a-c049-74d4-9d4a-a92c42c73d9e/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FF0000',
  },

  // Music & Audio
  {
    id: 'apple_music',
    name: 'Apple Music',
    category: 'Music',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/58/a3/37/58a337a3-5c74-e818-f291-76082b2aebfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FA2D48',
  },
  {
    id: 'youtube_music',
    name: 'YouTube Music',
    category: 'Music',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/64/45/b5/6445b53e-561b-aa3e-a74a-be73bbcd8459/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FF0000',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud Go',
    category: 'Music',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/59/e9/87/59e987c6-7a76-ca5f-7f55-16d44a282928/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FF5500',
  },

  // Gaming
  {
    id: 'playstation_plus',
    name: 'PlayStation Plus',
    category: 'Gaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/9a/36/47/9a364748-038d-1941-ad4e-4f0ba4f0da99/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#003791',
  },
  {
    id: 'xbox_game_pass',
    name: 'Xbox Game Pass',
    category: 'Gaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0d/bb/ea/0dbbea14-e0eb-047f-f7d9-c9a9dc898495/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#107C10',
  },
  {
    id: 'discord_nitro',
    name: 'Discord Nitro',
    category: 'Gaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/21/df/b5/21dfb5c1-9ba6-3f19-bdf3-fe7876a3e144/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#5865F2',
  },
  {
    id: 'nintendo_switch',
    name: 'Nintendo Switch Online',
    category: 'Gaming',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5a/09/27/5a0927df-2f3b-6f67-857c-f1bc17ff0a93/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#E60012',
  },

  // Fitness & Learning
  {
    id: 'duolingo',
    name: 'Duolingo Super',
    category: 'Fitness',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/10/7c/4f/107c4f4e-2895-ca0a-fc4a-5fe409867c29/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#58CC02',
  },
  {
    id: 'strava',
    name: 'Strava Subscription',
    category: 'Fitness',
    iconUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/37/ba/a1/37baa112-cb57-0a95-5cb9-7f3ef423bcfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    color: '#FC4C02',
  },
];

export interface AppStoreSearchResult {
  id: string;
  name: string;
  category: string;
  iconUrl: string;
  sellerName?: string;
}

/**
 * Searches the public iTunes Search API for apps & subscription services
 * Uses country=PH for localizing Philippine apps like Shopee, PLDT, Lazada, GCash, Maya, etc.
 */
export async function searchAppStoreApi(query: string): Promise<AppStoreSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const url = `https://itunes.apple.com/search?term=${cleanQuery}&country=PH&entity=software&limit=25`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results
      .filter((item: any) => {
        const icon = item.artworkUrl512 || item.artworkUrl100 || item.artworkUrl60;
        return typeof icon === 'string' && icon.trim().length > 0;
      })
      .map((item: any) => {
        // Clean app name (remove subtitle marketing noise like ': Watch, Listen...')
        let cleanName = (item.trackName || item.trackCensoredName || '').split(/[:\-–—|]/)[0].trim();
        if (!cleanName) cleanName = item.trackName;

        return {
          id: `app_${item.trackId}`,
          name: cleanName,
          category: item.primaryGenreName || 'App',
          iconUrl: item.artworkUrl512 || item.artworkUrl100 || item.artworkUrl60,
          sellerName: item.sellerName,
        };
      });
  } catch (error) {
    return [];
  }
}

/**
 * Automatically resolves and finds a logo icon URL or local asset key for ANY subscription name
 */
export function resolveSubscriptionLogo(title?: string, explicitIcon?: string): string | null {
  if (explicitIcon) return explicitIcon;
  if (!title) return null;

  const t = title.toLowerCase().trim();

  // 1. Check presets
  const matched = POPULAR_SUBSCRIPTIONS.find(
    p => t === p.name.toLowerCase() || t.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(t)
  );
  if (matched?.localIconKey) return matched.localIconKey;
  if (matched?.iconUrl) return matched.iconUrl;

  // 2. Keyword brand directory for automatic logo resolution
  const BRAND_DIRECTORY: Record<string, string> = {
    // Philippine Telco & Utilities / WiFi
    pldt: 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/21/53/78/21537829-9e85-b1a1-f3b1-a96cbbfa4ca1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    'pldt wifi': 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/21/53/78/21537829-9e85-b1a1-f3b1-a96cbbfa4ca1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    'pldt home': 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/21/53/78/21537829-9e85-b1a1-f3b1-a96cbbfa4ca1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    'pldt fiber': 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/21/53/78/21537829-9e85-b1a1-f3b1-a96cbbfa4ca1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    converge: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/0d/bb/ea/0dbbea14-e0eb-047f-f7d9-c9a9dc898495/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    globe: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/58/01/a8/5801a8ba-9941-ad4e-5e92-f04523c14d9b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    gfiber: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/58/01/a8/5801a8ba-9941-ad4e-5e92-f04523c14d9b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    smart: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bf/82/87/bf828775-697a-9721-a3f2-a083321558bf/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    dito: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/44/21/df/4421df6a-ea7b-c3fb-dfbc-fe1feefebf24/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    meralco: 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/55/e1/9f/55e19f18-6bb7-a69a-6531-15b5976b9117/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    maynilad: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/0d/bb/ea/0dbbea14-e0eb-047f-f7d9-c9a9dc898495/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',

    // Philippine Shopping & Wallets
    shopee: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bf/97/96/bf97960a-01dc-fa48-6a56-b08e7df0eb63/AppIcon_PH-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    shopeepay: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bf/97/96/bf97960a-01dc-fa48-6a56-b08e7df0eb63/AppIcon_PH-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    spaylater: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bf/97/96/bf97960a-01dc-fa48-6a56-b08e7df0eb63/AppIcon_PH-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    lazada: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/37/12/37/371237a3-5c74-e818-f291-76082b2aebfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    lazpaylater: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/37/12/37/371237a3-5c74-e818-f291-76082b2aebfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    grab: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/21/df/b5/21dfb5c1-9ba6-3f19-bdf3-fe7876a3e144/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    grabunlimited: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/21/df/b5/21dfb5c1-9ba6-3f19-bdf3-fe7876a3e144/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    foodpanda: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/80/7e/76/807e7616-5654-7389-c439-d50dcf3fca85/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    pandapro: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/80/7e/76/807e7616-5654-7389-c439-d50dcf3fca85/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    gcash: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/91/9f/bf/919fbf3a-96e0-2f92-5645-ec7e440b8529/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    maya: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/58/a3/37/58a337a3-5c74-e818-f291-76082b2aebfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    tiktok: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/31/ca/4f/31ca4f8c-c46a-7965-0a86-7a875bf97d3a/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',

    // Global Streaming & AI
    netflix: 'netflix.png',
    spotify: 'spotify.png',
    disney: 'disney.png',
    prime: 'prime.png',
    amazon: 'prime.png',
    chatgpt: 'chatgpt.png',
    openai: 'chatgpt.png',
    gemini: 'gemini.png',
    capcut: 'capcut.png',
    youtube: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/55/e1/9f/55e19f18-6bb7-a69a-6531-15b5976b9117/logo_youtube_color-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    apple: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/05/cf/43/05cf438a-028c-9c71-c063-2a441399435b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    icloud: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bc/26/1e/bc261e47-e117-91fb-5536-1e65d214643c/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    canva: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/9f/bf/919fbf3a-96e0-2f92-5645-ec7e440b8529/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    notion: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e5/22/e1/e522e1c9-7ef2-7c87-84ec-15b9c02da8c8/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    figma: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/05/cf/a6/05cfa69b-86d7-8547-06ad-4569c766b19a/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    claude: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bb/a2/12/bba21200-a92c-569a-ca2c-e3a5cbca7c79/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    github: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1b/ad/b4/1badb420-9993-9eb6-f48a-6ce470bc5531/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    adobe: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c3/84/ca/c384ca4a-c049-74d4-9d4a-a92c42c73d9e/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    microsoft: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bf/82/87/bf828775-697a-9721-a3f2-a083321558bf/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    google: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b9/69/fb/b969fb23-74d3-488f-4a0b-ae9e27c1f8a8/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    playstation: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/9a/36/47/9a364748-038d-1941-ad4e-4f0ba4f0da99/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    xbox: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0d/bb/ea/0dbbea14-e0eb-047f-f7d9-c9a9dc898495/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    discord: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/21/df/b5/21dfb5c1-9ba6-3f19-bdf3-fe7876a3e144/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    nintendo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5a/09/27/5a0927df-2f3b-6f67-857c-f1bc17ff0a93/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    duolingo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/10/7c/4f/107c4f4e-2895-ca0a-fc4a-5fe409867c29/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    strava: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/37/ba/a1/37baa112-cb57-0a95-5cb9-7f3ef423bcfe/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    hulu: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e5/27/b1/e527b134-8c88-1bfd-c073-67c8be0c273e/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    crunchyroll: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/80/7e/76/807e7616-5654-7389-c439-d50dcf3fca85/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    hbo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a4/09/b8/a409b83b-9a29-009d-cb9e-56e632d4b684/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
  };

  for (const [k, v] of Object.entries(BRAND_DIRECTORY)) {
    if (t.includes(k)) {
      return v;
    }
  }

  return null;
}
