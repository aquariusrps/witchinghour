import nextConfig from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextConfig,
  {
    rules: {
      // App Router loads fonts in root layout.tsx via <link> tags — correct pattern per project
      // convention (Process §19). The Pages Router rule is a false positive here.
      '@next/next/no-page-custom-font': 'off',
    },
  },
]

export default config
