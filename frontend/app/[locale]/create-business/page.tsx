'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export default function CreateBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedHero, setSelectedHero] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>('');

  
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    description: '',
    services: '',
    email: '',
    phone: '',
    address: '',
    brand_color: '#059669',
    template: 'modern',
    use_ai: true
  });

  const templates = [
    {
      name: 'modern',
      title: 'Modern',
      description: 'Clean, professional wellness style',
      preview: '🎨',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'minimal',
      title: 'Minimal',
      description: 'Ultra-light, spacious design',
      preview: '✨',
      color: 'from-gray-500 to-slate-500'
    },
    {
      name: 'luxury',
      title: 'Luxury',
      description: 'Dark, elegant restaurant style',
      preview: '🌟',
      color: 'from-amber-600 to-orange-600'
    },
    {
      name: 'professional',
      title: 'Professional',
      description: 'Corporate with blue gradients',
      preview: '💼',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      const servicesArray = formData.services
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', userId);
      formDataToSend.append('business_name', formData.business_name);
      formDataToSend.append('industry', formData.industry);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('services', JSON.stringify(servicesArray));
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('brand_color', formData.brand_color);
      formDataToSend.append('template_name', formData.template);
      formDataToSend.append('use_ai', formData.use_ai.toString());
      
      if (selectedLogo) {
        formDataToSend.append('logo', selectedLogo);
      }
      if (selectedHero) {
  formDataToSend.append('hero_image', selectedHero);
}

      const response = await fetch(`${API_URL}/api/businesses`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend, // Send as FormData, not JSON
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to create business');
      }
    } catch (err) {
      setError('Network error. Make sure backend is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Webify</h1>
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">← Back to Dashboard</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Business</h2>
          <p className="text-xl text-gray-600">Fill in the details and let AI enhance your content</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Logo Upload */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-4">Business Logo (Optional)</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">🏢</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-emerald-700 transition-all"
                  >
                    📤 Upload Logo
                  </label>
                  <p className="text-sm text-gray-600 mt-2">
                    Upload your business logo. Recommended: Square image, at least 512x512px
                  </p>
                  {selectedLogo && (
                    <p className="text-sm text-green-600 mt-2">✅ {selectedLogo.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Image Upload */}
<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
  <label className="block text-lg font-semibold text-gray-900 mb-4">
    Website Hero Image (Optional)
  </label>

  <div className="flex items-center gap-6">
    <div className="w-48 h-32 bg-white rounded-xl border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden">
      {heroPreview ? (
        <img
          src={heroPreview}
          alt="Hero preview"
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
            reader.onloadend = () => {
              setHeroPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
        id="hero-upload"
      />

      <label
        htmlFor="hero-upload"
        className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-emerald-700 transition-all"
      >
        📤 Upload Hero Image
      </label>

      <p className="text-sm text-gray-600 mt-2">
        This image appears at the top of your website.  
        Recommended: Landscape image, at least 1200×600px
      </p>

      {selectedHero && (
        <p className="text-sm text-green-600 mt-2">
          ✅ {selectedHero.name}
        </p>
      )}
    </div>
  </div>
</div>


            {/* Template Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">Choose Your Website Theme</label>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.name}
                    onClick={() => setFormData({ ...formData, template: template.name })}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.template === template.name
                        ? 'border-emerald-600 bg-emerald-50 shadow-lg'
                        : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${template.color} text-white`}>
                        {template.preview}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    {formData.template === template.name && (
                      <div className="absolute top-3 right-3 text-emerald-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="e.g., Fresh Bites Cafe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Retail">Retail</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Beauty">Beauty & Spa</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Textile">Textile</option>
                    <option value="Fabrication">Fabrication</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>

                  </select>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                    {formData.use_ai && <span className="text-emerald-600 ml-2">✨ AI will enhance this</span>}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="e.g., We serve fresh food and coffee"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Keep it short - AI will expand it into professional content</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services (comma-separated)
                    {formData.use_ai && <span className="text-emerald-600 ml-2">✨ AI will enhance this</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="e.g., Coffee, Pastries, Breakfast"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="contact@business.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={formData.brand_color}
                      onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer"
                    />
                    <span className="text-gray-600">{formData.brand_color}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.use_ai}
                      onChange={(e) => setFormData({ ...formData, use_ai: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">✨ Use AI Enhancement</div>
                      <div className="text-sm text-gray-600">Let AI generate professional taglines and expand your description</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Your Business...' : 'Create Business & Generate Website'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}