'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getImageUrl } from '@/config';
import { 
  Plus, 
  ExternalLink, 
  Edit3, 
  Package, 
  TrendingUp, 
  Calendar,
  Building2,
  Clock,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';

interface Business {
  id: string;
  business_name: string;
  industry: string;
  tagline: string;
  brand_color: string;
  logo_url: string;
  hero_image_url: string;
  created_at: string;
  products_count?: number;
  views?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalProducts: 0,
    newestBusiness: null as Business | null,
    oldestDate: null as string | null
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');

    if (!userData || !userId) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchBusinesses(userId);
  }, []);

  const fetchBusinesses = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/businesses/user/${userId}`);
      const data = await response.json();

      if (response.ok) {
        const businessList = data.businesses || [];
        setBusinesses(businessList);
        
        console.log('✅ Businesses loaded:', businessList.length);
        
        const totalProducts = businessList.reduce((acc: number, b: Business) => 
          acc + (b.products_count || 0), 0
        );

        const newest = businessList.length > 0 ? businessList[0] : null;
        const oldest = businessList.length > 0 
          ? businessList[businessList.length - 1].created_at 
          : null;

        setStats({
          totalBusinesses: businessList.length,
          totalProducts: totalProducts,
          newestBusiness: newest,
          oldestDate: oldest
        });
      }
    } catch (error) {
      console.error('❌ Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (business: Business) => {
    setBusinessToDelete(business);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!businessToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/api/businesses/${businessToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Business deleted successfully');
        
        setBusinesses(prev => prev.filter(b => b.id !== businessToDelete.id));
        
        setStats(prev => ({
          ...prev,
          totalBusinesses: prev.totalBusinesses - 1,
          totalProducts: prev.totalProducts - (businessToDelete.products_count || 0)
        }));

        setDeleteModalOpen(false);
        setBusinessToDelete(null);

        alert('Business deleted successfully!');
      } else {
        const data = await response.json();
        console.error('❌ Delete failed:', data.error);
        alert(`Failed to delete business: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting business:', error);
      alert('An error occurred while deleting the business');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setBusinessToDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    router.push('/');
  };

  const getDaysSince = (date: string | null) => {
    if (!date) return 0;
    const created = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRelativeTime = (date: string | null) => {
    if (!date) return 'N/A';
    const days = getDaysSince(date);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  // Default fallback gradients if no brand color
  const defaultGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  const getBackgroundStyle = (business: Business, index: number) => {
    // Priority 1: Hero image
    if (business.hero_image_url) {
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url(${getImageUrl(business.hero_image_url)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Priority 2: Brand color gradient
    if (business.brand_color) {
      // Create a gradient from brand color to a darker shade
      return {
        background: `linear-gradient(135deg, ${business.brand_color} 0%, ${business.brand_color}dd 100%)`,
      };
    }
    
    // Priority 3: Default gradient
    return {
      background: defaultGradients[index % defaultGradients.length],
    };
  };

  const getButtonColor = (business: Business) => {
    return business.brand_color || '#059669';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <a 
                href="/en" 
                className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer"
              >
                Webify
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Businesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Businesses</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalBusinesses}</p>
                <p className="text-xs text-slate-500 mt-1">All active businesses</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
                <p className="text-xs text-slate-500 mt-1">Across all businesses</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Last Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Last Activity</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.newestBusiness ? getRelativeTime(stats.newestBusiness.created_at) : 'N/A'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.newestBusiness ? `${stats.newestBusiness.business_name} created` : 'No activity yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Account Age Info Bar */}
        {stats.oldestDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-8 border border-emerald-100"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Member for {getDaysSince(stats.oldestDate)} days</span>
                {' '}- You created your first business on {new Date(stats.oldestDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </motion.div>
        )}

        {/* My Businesses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">My Businesses</h2>
              <p className="text-slate-600 mt-1">Manage your websites and catalogs</p>
            </div>
            <motion.a
              href="/create-business"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Business</span>
            </motion.a>
          </div>

          {businesses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No businesses yet</h3>
              <p className="text-slate-600 mb-6">Create your first business to get started</p>
              <a
                href="/create-business"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Create Business</span>
              </a>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  {/* Card Header - WITH HERO IMAGE OR BRAND COLOR */}
                  <div 
                    className="relative h-40 p-6"
                    style={getBackgroundStyle(business, index)}
                  >
                    {/* Dark overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between">
                      {/* Top row: Logo + Delete */}
                      <div className="flex items-start justify-between">
                        {/* Logo or Building Icon */}
                        {business.logo_url ? (
  <div className="w-16 h-16 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-white/30">
    <img 
      src={getImageUrl(business.logo_url) || ''}
      alt={business.business_name}
      className="w-full h-full object-cover"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  </div>
) : (
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                            <Building2 className="w-8 h-8 text-white" />
                          </div>
                        )}

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteClick(business)}
                          className="p-2.5 hover:bg-red-500/30 rounded-lg transition-colors group/delete backdrop-blur-sm bg-black/20"
                          title="Delete business"
                        >
                          <Trash2 className="w-5 h-5 text-white group-hover/delete:text-red-200" />
                        </button>
                      </div>

                      {/* Bottom row: Business name */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                          {business.business_name}
                        </h3>
                        <p className="text-sm text-white/90 capitalize drop-shadow-md">
                          {business.industry}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Tagline */}
                    {business.tagline && (
                      <p className="text-sm text-slate-600 mb-4 italic line-clamp-2">
                        "{business.tagline}"
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Package className="w-4 h-4" />
                        <span className="text-xs font-medium">{business.products_count || 0} products</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">{getRelativeTime(business.created_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <motion.a
                        href={`${API_URL}/api/preview/${business.id}/modern`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                        style={{ 
                          backgroundColor: getButtonColor(business),
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Website</span>
                      </motion.a>

                      <div className="grid grid-cols-2 gap-2">
                        <motion.a
                          href={`/edit-business/${business.id}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-all border border-slate-200"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </motion.a>

                        <motion.a
                          href={`/products/${business.id}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center space-x-1 px-3 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg font-medium hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                          <Package className="w-4 h-4" />
                          <span className="text-sm">Products</span>
                        </motion.a>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center space-x-1 text-xs text-slate-400 mt-4">
                      <Calendar className="w-3 h-3" />
                      <span>Created {new Date(business.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && businessToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Delete Business</h3>
                  </div>
                  <button
                    onClick={handleDeleteCancel}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-slate-700 mb-2">
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-slate-900">{businessToDelete.business_name}</span>?
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  This will permanently delete the business and all associated products ({businessToDelete.products_count || 0} products). This action cannot be undone.
                </p>

                {/* Warning Box */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 mb-1">Warning</p>
                      <p className="text-xs text-red-700">
                        All products, images, and data associated with this business will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Business</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}