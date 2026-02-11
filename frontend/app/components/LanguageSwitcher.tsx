'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Always add locale prefix (both en and hi)
      router.push(`/${newLocale}`);
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="font-medium text-gray-700">{currentLanguage?.name}</span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isPending}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  locale === lang.code ? 'bg-indigo-50' : ''
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''} first:rounded-t-lg last:rounded-b-lg`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className={`font-medium ${locale === lang.code ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {lang.name}
                </span>
                {locale === lang.code && (
                  <svg className="w-5 h-5 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}