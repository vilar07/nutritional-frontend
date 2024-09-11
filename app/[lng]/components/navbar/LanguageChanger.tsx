"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { languages } from "@wac/app/i18n/settings";

export default function LanguageChanger({ locale }: { locale: string }) {
    const router = useRouter();
    const currentPathname = usePathname();

    const handleChange = (newLocale: string) => {
        router.push(currentPathname.replace(`/${locale}`, `/${newLocale}`));
    };

    return (
        <select value={locale} onChange={(e) => handleChange(e.target.value)} className="border-2 rounded-2xl p-2 hover:cursor-pointer">
            {languages.map((language, index) => (
                <option key={index} value={language}>
                    {language}
                </option>
            ))}
        </select>
    );
}
