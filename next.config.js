/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable ES modules support for dkg-publish
  experimental: {
    serverComponentsExternalPackages: ['dkg.js', 'assertion-tools', 'dkg-evm-module', 'ethers'],
  },
  // Transpile dkg-publish module
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle ES modules in dkg-publish
      config.externals = config.externals || [];
      config.externals.push({
        'dkg.js': 'commonjs dkg.js',
      });
    }
    return config;
  },
}

module.exports = nextConfig

