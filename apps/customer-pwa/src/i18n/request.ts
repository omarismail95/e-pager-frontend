import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, locales, type Locale } from '@epager/i18n'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('epager_locale')?.value
  const locale: Locale =
    localeCookie && locales.includes(localeCookie as Locale)
      ? (localeCookie as Locale)
      : defaultLocale

  const messages = (await import(`@epager/i18n/messages/${locale}.json`)) as {
    default: Record<string, unknown>
  }

  return {
    locale,
    messages: messages.default,
  }
})
