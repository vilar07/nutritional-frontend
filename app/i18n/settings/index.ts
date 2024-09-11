export const defaultNS = 'common';
export const cookieName = 'i18next';

export const fallbackLng = 'en';
export const languages = [fallbackLng, 'pt'];

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
