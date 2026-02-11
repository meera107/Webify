'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL, getImageUrl } from '@/config'; 

interface Product {
  id: string;
  business_id: string;
  product_name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  images: string[] | null;
}

interface Business {
  id: string;
  business_name: string;
  industry: string;
  brand_color: string;
  phone: string;
  email: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({}); // ✅ FIX #8: track image errors

  useEffect(() => {
    fetchData();
  }, [productId, businessId]);

  const fetchData = async () => {
    try {
      // ✅ FIXED: was using `${API_URL}/api/...` with literal "..." and also using undefined `baseUrl`
      const businessRes = await fetch(`${API_URL}/api/businesses/${businessId}`);
      const businessData = await businessRes.json();
      if (businessRes.ok) setBusiness(businessData);

      const productsRes = await fetch(`${API_URL}/api/products/${businessId}`); // ✅ FIXED: was using undefined baseUrl
      const productsData = await productsRes.json();

      if (productsRes.ok) {
        const allProducts = productsData.products || productsData || [];
        const foundProduct = allProducts.find((p: Product) => p.id === productId);
        if (foundProduct) setProduct(foundProduct);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <Link href={`/catalog/${businessId}`} className="text-indigo-600 hover:underline">
            ← Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const brandColor = business.brand_color || '#667eea';

  // Combine all images (main + additional, deduplicated)
  const allImages: string[] = [];
  if (product.image_url) allImages.push(product.image_url);
  if (product.images && Array.isArray(product.images)) {
    const additionalImages = product.images.filter(img => img !== product.image_url);
    allImages.push(...additionalImages);
  }

  const currentImagePath = allImages[selectedImageIndex] || null;
  const currentImageUrl = getImageUrl(currentImagePath);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/catalog/${businessId}`} className="flex items-center text-gray-700 hover:text-gray-900 font-medium">
              ← Back to Catalog
            </Link>
            <h1 className="text-xl font-bold" style={{ color: brandColor }}>
              {business.business_name}
            </h1>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8">

            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4" style={{ height: '500px' }}>
                {/* ✅ FIX #8: Proper fallback when image fails */}
                {currentImageUrl && !imageErrors[selectedImageIndex] ? (
                  <img
                    src={currentImageUrl}
                    alt={product.product_name}
                    className="w-full h-full object-contain"
                    onError={() => {
                      console.error('Image failed to load:', currentImageUrl);
                      setImageErrors(prev => ({ ...prev, [selectedImageIndex]: true }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-9xl">📦</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {allImages.map((imgPath, index) => {
                    const thumbnailUrl = getImageUrl(imgPath);
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative bg-gray-100 rounded-lg overflow-hidden h-20 border-2 transition-all ${
                          selectedImageIndex === index ? 'ring-2 ring-offset-2' : 'hover:opacity-75'
                        }`}
                        style={selectedImageIndex === index ? { borderColor: brandColor, boxShadow: `0 0 0 2px ${brandColor}` } : {}}>
                        {thumbnailUrl && !imageErrors[index] ? (
                          <img
                            src={thumbnailUrl}
                            alt={`${product.product_name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span
                  className="inline-block px-4 py-1 text-white text-sm font-semibold rounded-full mb-3"
                  style={{ backgroundColor: brandColor }}>
                  {product.category}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {product.product_name}
                </h1>
                <p className="text-5xl font-bold mb-6" style={{ color: brandColor }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Contact Section */}
              <div className="mt-auto pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested in this product?</h3>
                <p className="text-gray-600 mb-4">Contact us for more information or to place an order</p>

                <div className="space-y-3">
                  {business.phone && (
                    <a
                      href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${product.product_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-6 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: brandColor }}>
                      💬 WhatsApp Us
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}?subject=Inquiry about ${product.product_name}`}
                      className="block w-full text-center px-6 py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                      ✉️ Send Email
                    </a>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="block w-full text-center px-6 py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                      📞 Call: {business.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">More Products</h2>
            <Link href={`/catalog/${businessId}`} className="text-emerald-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}