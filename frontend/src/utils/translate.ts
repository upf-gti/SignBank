import { i18n } from 'boot/i18n';

export default function translate (key: string, params?: Record<string, unknown>) {
    if (!key) return ''
    if (params) {
        return i18n.global.t(key, params)
    }
    return i18n.global.t(key)
  }