// next.config.js

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  trailingSlash: true,

  // only use these when building for production (npm run build)
  basePath: isProd ? '/talo_public' : '',
  assetPrefix: isProd
    ? 'https://winstonbarlowg.github.io/talo_public/'
    : '',
};

module.exports = nextConfig;