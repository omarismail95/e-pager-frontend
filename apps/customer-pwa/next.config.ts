import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const INTERNAL_PACKAGES = ['@epager/ui', '@epager/auth', '@epager/api-client', '@epager/i18n']

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: INTERNAL_PACKAGES,
  env: {
    NEXT_PUBLIC_APP_NAME: 'E-Pager',
  },
}

export default withNextIntl(nextConfig)
