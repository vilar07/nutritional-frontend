'use client';
import { useTranslation } from '@wac/app/i18n/client';

interface PropsType {
  params: { lng: string };
}

export default function Page({ params: { lng } }: PropsType) {
  const { t } = useTranslation(lng, 'dashboard');

  return (
    <section className="w-full h-48 flex flex-col items-center justify-center gap-10 bg-gray-100">
      <h1>{t('title')}</h1>
    </section>
  );
}
