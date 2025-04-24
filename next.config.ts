/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) static-export mode
  output: 'export',

  // 2) every path ends with a slash so GitHub Pages can serve index.html
  trailingSlash: true,

  // 3) routes live under this sub-folder
  basePath: '/talo_public',

  // 4) assets (CSS/JS) must be loaded from the full GitHub Pages URL
  assetPrefix: 'https://winstonbarlowg.github.io/talo_public/',
};

export default nextConfig;