import { useTranslation } from "../component/useTranslation";
interface LangProps {
    lang: string;
}
export default function Loading({ lang }: LangProps) {
    const t = useTranslation(lang);
    return (
        <div className="flex items-center justify-center min-h-screen">
            {t.loading}
        </div>
    );
}
