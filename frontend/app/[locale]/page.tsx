import {useTranslations} from 'next-intl';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo area */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                W
              </div>
              <h1 className="text-xl font-bold text-stone-900">Webify</h1>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 items-center">
              <LanguageSwitcher />
              <a href="/login" className="text-stone-600 hover:text-emerald-700 px-4 py-2 text-sm font-semibold transition-colors">
                {t('nav.login')}
              </a>
              <a href="/signup" className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm">
                {t('nav.signup')}
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-6">
              <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                {t('hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-stone-900 leading-tight">
                {t('hero.title')} <br />
                <span className="text-emerald-600">{t('hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed max-w-lg">
                {t('hero.description')}
              </p>
              
              <div className="pt-4 flex gap-4">
  <a
    href="/signup"
    className="inline-flex items-center justify-center bg-emerald-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
  >
    {t('hero.cta')}
  </a>

  
</div>

            </div>

            {/* Hero Image - Form to Website & Brochure Flow */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-30"></div>
              
              <div className="relative space-y-6">
                {/* Step 1: Form Input */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <span className="text-sm font-semibold text-stone-700">Fill Simple Form</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="h-3 w-32 bg-stone-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="h-3 w-40 bg-stone-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="h-3 w-36 bg-stone-200 rounded"></div>
                    </div>
                  </div>
                  <div className="mt-4 h-8 w-24 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Submit</span>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="flex justify-center">
                  <svg className="w-8 h-8 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Step 2: Output - Website & Brochure */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Website Preview */}
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-200 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-stone-700">Website</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 space-y-2">
                      <div className="h-2 w-full bg-blue-200 rounded"></div>
                      <div className="h-2 w-3/4 bg-blue-200 rounded"></div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="h-12 bg-blue-100 rounded"></div>
                        <div className="h-12 bg-blue-100 rounded"></div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold">Live</span>
                    </div>
                  </div>

                  {/* Brochure/Catalog Preview */}
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-200 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-stone-700">Catalog</span>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <div className="h-16 w-16 bg-orange-200 rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-2 w-full bg-orange-200 rounded"></div>
                          <div className="h-2 w-2/3 bg-orange-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-16 w-16 bg-orange-200 rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-2 w-full bg-orange-200 rounded"></div>
                          <div className="h-2 w-2/3 bg-orange-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold">PDF</span>
                    </div>
                  </div>
                </div>

                {/* Time indicator */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-bold text-emerald-700">Ready in 30 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Themes Section - Integrated Design */}
      <div className="bg-stone-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              Beautiful Themes for Every Business
            </h2>
            <p className="text-lg text-stone-600">
              Professional designs that perfectly match your brand identity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Luxury */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif">Luxury</h3>
                <p className="text-sm text-stone-600 mb-4">Premium & elegant layouts with sophisticated typography</p>
                <div className="flex gap-2 mt-auto">
                  <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-200"></div>
                </div>
              </div>
            </div>

            {/* Minimal */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2 font-mono">Minimal</h3>
                <p className="text-sm text-stone-600 mb-4">Clean & distraction-free design focusing on your content</p>
                <div className="flex gap-2 mt-auto">
                  <div className="w-2 h-2 rounded-full bg-stone-700"></div>
                  <div className="w-2 h-2 rounded-full bg-stone-400"></div>
                  <div className="w-2 h-2 rounded-full bg-stone-200"></div>
                </div>
              </div>
            </div>

            {/* Modern */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2 italic">Modern</h3>
                <p className="text-sm text-stone-600 mb-4">Bold & dynamic styling perfect for tech startups</p>
                <div className="flex gap-2 mt-auto">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                </div>
              </div>
            </div>

            {/* Professional */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Professional</h3>
                <p className="text-sm text-stone-600 mb-4">Corporate & trustworthy design for established businesses</p>
                <div className="flex gap-2 mt-auto">
                  <div className="w-2 h-2 rounded-full bg-blue-700"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>



      {/* How It Works */}
      <div className="bg-stone-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900">{t('howItWorks.title')}</h2>
            <p className="text-lg text-stone-600 mt-2">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-2xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">{t('howItWorks.step1.title')}</h3>
              <p className="text-stone-600 leading-relaxed">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-2xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">{t('howItWorks.step2.title')}</h3>
              <p className="text-stone-600 leading-relaxed">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-2xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">{t('howItWorks.step3.title')}</h3>
              <p className="text-stone-600 leading-relaxed">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section - REDESIGNED */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Visual Explanation */}
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-3xl opacity-30"></div>
                
                <div className="relative space-y-4">
                  {/* Website Card */}
                  <div className="bg-white p-5 rounded-xl shadow-lg border border-stone-200 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-stone-700">Your Website Products</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 bg-blue-200 rounded"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-2 w-full bg-blue-200 rounded"></div>
                            <div className="h-2 w-2/3 bg-blue-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 bg-blue-200 rounded"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-2 w-full bg-blue-200 rounded"></div>
                            <div className="h-2 w-2/3 bg-blue-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transform Arrow */}
                  <div className="flex justify-center py-2">
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="text-xs font-bold text-emerald-700">Auto-generate</span>
                    </div>
                  </div>

                  {/* PDF Catalog Card */}
                  <div className="bg-white p-5 rounded-xl shadow-lg border border-stone-200 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-stone-700">PDF Catalog</span>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 bg-orange-200 rounded"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-2 w-full bg-orange-200 rounded"></div>
                            <div className="h-2 w-2/3 bg-orange-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 bg-orange-200 rounded"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-2 w-full bg-orange-200 rounded"></div>
                            <div className="h-2 w-2/3 bg-orange-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold">Ready to share</span>
                      </div>
                      <div className="text-xs font-semibold text-stone-500">WhatsApp · Email</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="md:w-1/2">
              <h3 className="text-3xl font-bold text-stone-900 mb-4">
                {t('feature.title')} <br/>{t('feature.titleHighlight')}
              </h3>
              <p className="text-lg text-stone-600 mb-6">
                {t('feature.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-stone-700">
                  <span className="text-emerald-500 font-bold">✓</span> {t('feature.benefit1')}
                </li>
                <li className="flex items-center gap-3 text-stone-700">
                  <span className="text-emerald-500 font-bold">✓</span> {t('feature.benefit2')}
                </li>
                <li className="flex items-center gap-3 text-stone-700">
                  <span className="text-emerald-500 font-bold">✓</span> {t('feature.benefit3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-stone-50 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-900 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('cta.title')}</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              <a href="/signup" className="inline-block bg-white text-emerald-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                {t('cta.button')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-stone-500 mb-4">{t('footer.copyright')}</p>
          <div className="flex justify-center gap-6 text-sm text-stone-400">
            <a href="#" className="hover:text-stone-600">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-stone-600">{t('footer.terms')}</a>
            <a href="#" className="hover:text-stone-600">{t('footer.support')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}