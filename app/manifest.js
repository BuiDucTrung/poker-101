import { SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '../lib/site';

export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'vi',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d1511',
    theme_color: '#0b120e',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
