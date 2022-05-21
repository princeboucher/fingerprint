/**
 * @type {import('next').NextConfig}
 */

// next.config.js
const withPlugins = require("next-compose-plugins");
const optimizedImages = require("next-optimized-images");

module.exports = withPlugins([
  [
    optimizedImages,
    {
      /* config for next-optimized-images */
    },
  ],

  // your other plugins here
]);

const { withContentlayer } = require("next-contentlayer");

module.exports = withContentlayer({
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        "react/jsx-runtime.js": "preact/compat/jsx-runtime",
        react: "preact/compat",
        "react-dom": "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
      });

      module.exports = {
        exportPathMap: async function (
          defaultPathMap,
          { dev, dir, outDir, distDir, buildId }
        ) {
          return {
            "/": { page: "/" },
            "/articles": { page: "/articles" },
            "/categories": { page: "/categories" },
            "/projects": { page: "/projects" },
          };
        },
      };
    }

    return config;
  },
  async redirects() {
    return [
      {
        source: "/concepts/:slug",
        destination: "/articles/:slug",
        permanent: true,
      },
    ];
  },
});
