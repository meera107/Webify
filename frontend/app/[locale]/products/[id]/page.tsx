'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_URL, getImageUrl } from '@/config';

interface Product {
  id: string;
  business_id: string;
  product_name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  images: string[];
  created_at: string;
}

export default function ManageProductsPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [searchCategory, setSearchCategory] = useState('');
const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0',
    category: ''
  });

  useEffect(() => {
    fetchBusiness();
    fetchProducts();
  }, [businessId]);
  // Extract unique categories from products
useEffect(() => {
  if (products.length > 0) {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    setCategories(uniqueCategories);
  }
}, [products]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/api/businesses/${businessId}`);
      const data = await response.json();
      if (response.ok) setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${businessId}`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  if (files.length > 5) {
    alert('Maximum 5 images allowed');
    return;
  }
  
  console.log(`📷 Selected ${files.length} images`);
  setSelectedImages(files);
  
  // Create previews - FIXED VERSION
  const previews: string[] = [];
  let loadedCount = 0;
  
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      previews[index] = reader.result as string;
      loadedCount++;
      
      if (loadedCount === files.length) {
        console.log(`✅ All ${files.length} previews loaded`);
        setImagePreviews([...previews]);
      }
    };
    reader.readAsDataURL(file);
  });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('business_id', businessId);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    
    // Append multiple images
    selectedImages.forEach((image) => {
      formDataToSend.append(`images`, image);
    });

    try {
      const url = editingProduct 
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert(editingProduct ? 'Product updated!' : 'Product added!');
        setFormData({ name: '', description: '', price: '0', category: '' });
        setSelectedImages([]);
        setImagePreviews([]);
        setShowAddForm(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert('Error saving product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.product_name || '',
      description: product.description || '',
      price: product.price?.toString() || '0',
      category: product.category || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Product deleted!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const shareCatalog = () => {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
    const catalogUrl = `${baseUrl}/en/catalog/${businessId}`;
    
    try {
      navigator.clipboard.writeText(catalogUrl);
      alert('📋 Catalog link copied to clipboard!\n\nShare this link with your clients:\n' + catalogUrl);
    } catch (error) {
      alert('📋 Catalog Link:\n\n' + catalogUrl + '\n\nCopy this link to share with your clients!');
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '0', category: '' });
    setSelectedImages([]);
    setImagePreviews([]);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

 const filteredProducts = products.filter((p) => {
  if (!searchCategory) return true;

  const q = searchCategory.toLowerCase();

  const searchableText = `
    ${p.product_name}
    ${p.description}
    ${p.category}
    ${p.price}
  `.toLowerCase();

  return searchableText.includes(q);
});


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manage Products</h1>
              <p className="text-sm text-gray-500">{business?.business_name}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={shareCatalog}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                📤 Share Catalog
              </button>
              <button 
                onClick={() => {
                  cancelEdit();
                  setShowAddForm(!showAddForm);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                {showAddForm ? 'Cancel' : '+ Add Product'}
              </button>
              <a href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g., Premium Yoga Mat"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                    placeholder="999.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                    placeholder="e.g., Fitness Equipment"
                  />
                </div>
              </div>

              {/* Multiple Image Upload */}
              <div className="bg-gradient-to-br from-green-50 to-green-50 rounded-xl p-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Product Images (Up to 5 images)
                </label>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-emerald-200"
                        />
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-images"
                />
                <label 
                  htmlFor="product-images"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-emerald-700 transition-all">
                  📷 {selectedImages.length > 0 ? `${selectedImages.length} images selected` : 'Choose Images'}
                </label>
                <p className="text-xs text-gray-600 mt-2">
                  Select up to 5 images. First image will be the main product image.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Add your first product to get started</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">
              Add Your First Product
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold text-gray-900">
    Products ({filteredProducts.length}{searchCategory ? ` in "${searchCategory}"` : ` Total: ${products.length}`})
  </h2>
</div>

{/* Category Filter Section */}
<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
  <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 Filter by Category</h3>
  
  {/* Category Buttons */}
  <div className="flex flex-wrap gap-3 mb-4">
    <button
      onClick={() => setSearchCategory('')}
      className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
        searchCategory === '' 
          ? 'bg-emerald-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}>
      All Products ({products.length})
    </button>
    
    {categories.map(category => {
      const count = products.filter(p => p.category === category).length;
      return (
        <button
          key={category}
          onClick={() => setSearchCategory(category)}
          className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
            searchCategory === category 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          {category} ({count})
        </button>
      );
    })}
  </div>
  
  {/* Search Input */}
  <div className="relative">
    <input
      type="text"
      placeholder="Type to search"
      value={searchCategory}
      onChange={(e) => setSearchCategory(e.target.value)}
      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg text-gray-900 font-medium"    />
    <span className="absolute left-4 top-3.5 text-2xl">🔍</span>
    {searchCategory && (
      <button
        onClick={() => setSearchCategory('')}
        className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl font-bold">
        ✕
      </button>
    )}
  </div>
  
  {searchCategory && (
    <p className="mt-3 text-sm text-gray-600">
      Showing {filteredProducts.length} product(s) matching "{searchCategory}"
    </p>
  )}
</div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
                    {product.image_url ? (
                      <>
                        <img 
                          src={getImageUrl(product.image_url) || ''}onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                        {product.images && product.images.length > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            +{product.images.length} more
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full">
                        {product.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.product_name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-emerald-600">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && searchCategory && (
  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-4xl">🔍</span>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
    <p className="text-gray-600 mb-6">
      No products found in "{searchCategory}" category
    </p>
    <button 
      onClick={() => setSearchCategory('')}
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
      Show All Products
    </button>
  </div>
)}
          </div>
        )}
      </div>
    </div>
  );
}