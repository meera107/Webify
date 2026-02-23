'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_URL, getImageUrl } from '@/config'; 
export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedHero, setSelectedHero] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>('');
  const templates = [
    { name: 'modern', title: 'Modern', desc: 'Clean professional style', color: 'from-indigo-500 to-purple-500' },
    { name: 'minimal', title: 'Minimal', desc: 'Ultra-light spacious', color: 'from-gray-400 to-slate-500' },
    { name: 'luxury', title: 'Luxury', desc: 'Dark elegant', color: 'from-amber-600 to-orange-600' },
    { name: 'professional', title: 'Professional', desc: 'Corporate blue', color: 'from-blue-500 to-cyan-500' }
  ];
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        // ✅ FIXED: was using broken template literal with API_URL inside a string
        const response = await fetch(`${API_URL}/api/businesses/${businessId}`, { credentials: 'include' });
        const data = await response.json();
        if (response.ok) {
          setBusiness(data);
          console.log('🔍 Business loaded:', data);
          console.log('📸 Logo URL:', data.logo_url);
          console.log('🖼️ Hero URL:', data.hero_image_url);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [businessId]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const formData = new FormData();

      Object.keys(business).forEach(key => {
        if (business[key] !== null && business[key] !== undefined) {
          // NEVER send image URLs - backend handles them
          if (key === 'logo_url') return;
          if (key === 'hero_image_url') return;
          formData.append(key, business[key]);
        }
      });

      if (selectedLogo) formData.append('logo', selectedLogo);
      if (selectedHero) formData.append('hero_image', selectedHero);

      // ✅ FIXED: was using broken template literal with API_URL inside a string
      const response = await fetch(`${API_URL}/api/businesses/${businessId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBusiness = data.business || data;
        setBusiness(updatedBusiness);

        setSelectedLogo(null);
        setSelectedHero(null);
        setLogoPreview('');
        setHeroPreview('');

        alert('Changes saved successfully!');
      } else {
        throw new Error('Failed to save');
      }

    } catch (error) {
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <a href="/dashboard" className="text-indigo-600">Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-emerald-600">Edit Website</h1>
              <p className="text-sm text-gray-500">{business.business_name}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* ✅ FIXED: was using broken template literal */}
                <a 
                href={`${API_URL}/api/preview/${businessId}/${business.template_name || 'modern'}?t=${Date.now()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium transition-colors duration-150 hover:bg-gray-600 hover:text-white"
                >
                View Live Site
                </a>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <a href="/dashboard" className="px-4 py-2 text-emerald-700 hover:text-green-900 font-medium">
                Back
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Edit Sections</h3>
              <div className="space-y-2">
                {['template', 'content', 'contact', 'style', 'social'].map(tab => (
                    <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium capitalize ${activeTab === tab ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'} ${
                      activeTab === tab ? '' : 'text-gray-700'
                    }`}>
                    {tab === 'style' ? 'Style & Images' : tab === 'contact' ? 'Contact Info' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'template' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Template</h2>
                <p className="text-gray-600 mb-6">Select a design that matches your brand</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <button
                      key={template.name}
                      onClick={() => setBusiness({...business, template_name: template.name})}
                      className={`p-6 rounded-xl border-2 text-left ${business.template_name === template.name ? 'border-emerald-600 bg-emerald-50 shadow-lg' : 'border-gray-200 hover:border-emerald-300'}`}>
                      <div className={`w-full h-24 bg-gradient-to-r ${template.color} rounded-lg mb-4`}></div>
                      <h3 className="font-bold text-gray-900 mb-1">{template.title}</h3>
                      <p className="text-sm text-gray-600">{template.desc}</p>
                      {business.template_name === template.name && (
                        <div className="mt-3 text-sm text-emerald-600 font-semibold">Currently Active</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={business.business_name}
                      onChange={e => setBusiness({...business, business_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                    <select
                      value={business.industry || 'Other'}
                      onChange={e => setBusiness({...business, industry: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900">
                      {['Restaurant','Cafe','Retail','Wellness','Beauty','Fitness','Consulting','Real Estate','Technology','Healthcare','Education','Other'].map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={business.tagline || ''}
                      onChange={e => setBusiness({...business, tagline: e.target.value})}
                      placeholder="Your catchy tagline"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">A short memorable phrase about your business</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={business.description || ''}
                      onChange={e => setBusiness({...business, description: e.target.value})}
                      rows={5}
                      placeholder="Tell visitors about your business..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">This appears on your homepage</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-5">
                  {[
                    { label: 'Email', key: 'email', type: 'email', placeholder: 'contact@business.com' },
                    { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
                    { label: 'Address', key: 'address', type: 'text', placeholder: '123 Main St, City, State' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        value={business[field.key] || ''}
                        onChange={e => setBusiness({...business, [field.key]: e.target.value})}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Styling & Images</h2>
                <div className="space-y-8">

                  {/* LOGO UPLOAD SECTION */}
                  <div className="pb-6 border-b">
                    <label className="block text-lg font-bold text-gray-900 mb-4">Business Logo</label>
                    <div className="flex items-start gap-6">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoPreview ? (
                          <img src={logoPreview} alt="New logo" className="w-full h-full object-contain" />
                        ) : business.logo_url ? (
                          // ✅ FIXED: was incorrectly showing hero_image_url for logo
                          <img
                            src={getImageUrl(business.logo_url) || ''}
                            alt="Current logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-4xl">🏢</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedLogo(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setLogoPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="logo-upload-edit"
                        />
                        <label htmlFor="logo-upload-edit" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-emerald-700 transition-all">
                          📤 Upload New Logo
                        </label>
                        <p className="text-sm text-gray-600 mt-2">Square image recommended (512x512px)</p>
                        {selectedLogo && <p className="text-sm text-green-600 mt-2 font-semibold">✅ New logo selected: {selectedLogo.name}</p>}
                        {business.logo_url && !selectedLogo && <p className="text-sm text-gray-500 mt-2">Current logo is set</p>}
                      </div>
                    </div>
                  </div>

                  {/* HERO IMAGE UPLOAD SECTION */}
                  <div className="pb-6 border-b">
                    <label className="block text-lg font-bold text-gray-900 mb-4">Hero Image</label>
                    <div className="flex items-start gap-6">
                      <div className="w-48 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {heroPreview ? (
                          <img src={heroPreview} alt="New hero" className="w-full h-full object-cover" />
                        ) : business.hero_image_url ? (
                          // ✅ CORRECT: using getImageUrl from config
                          <img
                            src={getImageUrl(business.hero_image_url) || ''}
                            alt="Current hero"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">🖼️</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedHero(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setHeroPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="hero-upload-edit"
                        />
                        <label htmlFor="hero-upload-edit" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-emerald-700 transition-all">
                          📤 Upload New Hero Image
                        </label>
                        <p className="text-sm text-gray-600 mt-2">Landscape image recommended (1200x600px)</p>
                        {selectedHero && <p className="text-sm text-green-600 mt-2 font-semibold">✅ New hero image selected: {selectedHero.name}</p>}
                        {business.hero_image_url && !selectedHero && <p className="text-sm text-gray-500 mt-2">Current hero image is set</p>}
                      </div>
                    </div>
                  </div>

                  {/* BRAND COLOR SECTION */}
                  <div className="pb-6 border-b">
                    <label className="block text-lg font-bold text-gray-900 mb-4">Brand Color</label>
                    <div className="flex gap-4">
                      <input
                        type="color"
                        value={business.brand_color || '#059669'}
                        onChange={e => setBusiness({...business, brand_color: e.target.value})}
                        className="w-24 h-24 rounded-lg cursor-pointer border-4 border-gray-200"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={business.brand_color || '#059669'}
                          onChange={e => setBusiness({...business, brand_color: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-2">This color will be used throughout your website</p>
                      </div>
                    </div>
                  </div>

                  {/* COLOR PRESETS */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-4">Quick Color Presets</label>
                    <div className="grid grid-cols-8 gap-3">
                      {['#667eea','#f56565','#48bb78','#ed8936','#9f7aea','#38b2ac','#e53e3e','#3182ce','#805ad5','#d69e2e','#319795','#dd6b20','#c53030','#2c5282','#553c9a','#234e52'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBusiness({...business, brand_color: color})}
                          className="h-12 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform"
                          style={{backgroundColor: color}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media Links</h2>
                <p className="text-gray-600 mb-6">Add your social media profiles</p>
                <div className="space-y-5">
                  {[
                    { label: 'Facebook', key: 'facebook_url', placeholder: 'https://facebook.com/yourpage' },
                    { label: 'Instagram', key: 'instagram_url', placeholder: 'https://instagram.com/yourprofile' },
                    { label: 'LinkedIn', key: 'linkedin_url', placeholder: 'https://linkedin.com/company/yourcompany' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                      <input
                        type="url"
                        value={business[field.key] || ''}
                        onChange={e => setBusiness({...business, [field.key]: e.target.value})}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}