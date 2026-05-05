# Bangumi API

The anime page can fetch watched anime from Bangumi during Astro build.

1. Set `siteConfig.bangumi.userId` in `src/config.ts`.
2. Change `siteConfig.bangumi.mode` to `"bangumi"`.
3. Create a local `.env` file:

```env
BANGUMI_TOKEN=your_bangumi_personal_access_token
```

Do not commit `.env`. The token is read only at build time, so it is not shipped to the browser.
