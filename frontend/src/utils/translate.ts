import { i18n } from 'boot/i18n';

export default function translate (key: string) {
    if (!key) return ''
    return i18n.global.t(key)
  }