'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL, getImageUrl } from '@/config';


interface Product {
  id: string;
  product_name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  images: string[];
}

interface Business {
  id: string;
  business_name: string;
  industry: string;
  tagline: string;
  brand_color: string;
  phone: string;
  email: string;
  address: string;
}


export default function PublicCatalogPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState(''); 

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    try {      
      console.log('🔍 PUBLIC CATALOG - Fetching business:', businessId);
      
      const businessRes = await fetch(`${API_URL}/api/businesses/${businessId}`);
      const businessData = await businessRes.json();
      console.log('📊 Business data:', businessData);
      if (businessRes.ok) setBusiness(businessData);

      const productsRes = await fetch(`${API_URL}/api/products/${businessId}`);
      const productsData = await productsRes.json();
      console.log('📦 Products data:', productsData);
      if (productsRes.ok) {
        setProducts(productsData.products || productsData || []);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

const filteredProducts = products.filter((product) => {
  const matchCategory =
    selectedCategory === 'All' || product.category === selectedCategory;

  const q = search.toLowerCase().trim();

  // Only search meaningful fields, not image paths or IDs
  const searchableText = [
    product.product_name,
    product.description,
    product.category,
    String(product.price)
  ].join(' ').toLowerCase();

  const matchSearch = q === '' || searchableText.includes(q);

  return matchCategory && matchSearch;
});
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading catalog...</p>
        </div>
      </div>
    );
  }
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600">This catalog may no longer be available.</p>
        </div>
      </div>
    );
  }

  const brandColor = business.brand_color || '#667eea';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header 
        className="text-white shadow-2xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-4 text-black">
              CATALOG
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg">
              {business.business_name}
            </h1>
            {business.tagline && (
              <p className="text-2xl opacity-95 mb-4 font-light">{business.tagline}</p>
            )}
            <p className="text-lg opacity-90 font-medium">{business.industry}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black opacity-10"></div>
      </header>

      <div className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all transform ${
                  selectedCategory === category
                    ? 'text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                style={selectedCategory === category ? { backgroundColor: brandColor } : {}}>
                {category}
              </button>
            ))}
          </div>
        </div>
          <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No Products Available</h3>
            <p className="text-gray-600 text-lg">Check back soon for new products!</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {selectedCategory === 'All' ? 'All Products' : `📂 ${selectedCategory}`}
              </h2>
              <p className="text-gray-500 text-lg">
                Showing <span className="font-bold text-green-600">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => {
                const imageUrl = getImageUrl(product.image_url);
                
                return (
                  <Link 
                    key={product.id}
                    href={`/catalog/${businessId}/product/${product.id}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200">
                    
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            console.error('Product image failed to load:', imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl">📦</span>
                        </div>
                      )}
                      <div 
                        className="absolute top-4 right-4 px-4 py-2 text-white text-xs font-black rounded-full shadow-lg"
                        style={{ backgroundColor: brandColor }}>
                        {product.category}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-green-600 transition-colors">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-3xl font-black"
                          style={{ color: brandColor }}>
                          ₹{product.price.toLocaleString('en-IN')}

                        </span>
                        <span className="text-sm font-semibold text-gray-500 group-hover:text-green-600 transition-colors">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-3xl font-black mb-3">💬 Interested in our products?</h3>
            <p className="text-gray-300 text-lg mb-8">Get in touch with us for more information</p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`}
                  className="px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-xl"
                  style={{ backgroundColor: brandColor }}>
                  📞 Call Us
                </a>
              )}
              {business.email && (
                <a 
                  href={`mailto:${business.email}`}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-xl hover:scale-105">
                  ✉️ Email Us
                </a>
              )}
            </div>

            <div className="text-gray-300 space-y-2">
              {business.phone && <p className="text-lg">📞 {business.phone}</p>}
              {business.email && <p className="text-lg">✉️ {business.email}</p>}
              {business.address && <p className="text-lg">📍 {business.address}</p>}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Powered by Webify • Product Catalog System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}