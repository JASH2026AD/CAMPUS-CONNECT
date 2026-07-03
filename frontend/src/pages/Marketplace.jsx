import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { Search, Plus, Filter, Heart, Tag, Star, X } from 'lucide-react';
import api from '../api/axios';

export default function Marketplace() {
  const { showToast } = showToast || { showToast: console.log }; // fallback safety
  const toast = useToast();
  const alertToast = (msg, type) => toast ? toast.showToast(msg, type) : console.log(msg);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  
  // Create listing modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [newCategory, setNewCategory] = useState('BOOKS');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'BOOKS', 'ELECTRONICS', 'STATIONERY', 'LAB_EQUIPMENT', 'OTHERS'];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketplace', {
        params: { category, query }
      });
      setItems(res.data);

      // Fetch user's wishlist
      const wishRes = await api.get('/marketplace/user/wishlist');
      setWishlistIds(wishRes.data.map(item => item.id));
    } catch (err) {
      console.error('Error fetching marketplace items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleWishlistToggle = async (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/marketplace/${itemId}/wishlist`);
      if (res.data.wishlisted) {
        setWishlistIds(prev => [...prev, itemId]);
        alertToast('Added to wishlist! ❤️', 'success');
      } else {
        setWishlistIds(prev => prev.filter(id => id !== itemId));
        alertToast('Removed from wishlist.', 'info');
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!title || !description || !price) {
      alertToast('Please fill in title, description, and price.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/marketplace', {
        title,
        description,
        price: parseFloat(price),
        category: newCategory,
        images: imageUrl ? [imageUrl] : []
      });

      alertToast('Product listed successfully! 🛍️', 'success');
      setModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      fetchItems();
    } catch (err) {
      console.error('Create listing error:', err);
      alertToast('Failed to create listing.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader title="Campus Marketplace" subtitle="Buy and sell textbooks, electronics, and supplies with classmates" emoji="🛒" />
        
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-premium transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Post New Listing
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-primary text-white border-primary shadow-premium'
                  : 'bg-white/60 dark:bg-slate-900/30 text-gray-500 hover:text-primary dark:text-gray-300 border-gray-200/50 dark:border-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Items 🏷️' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 min-w-[200px] sm:min-w-[280px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Find
          </button>
        </form>
      </div>

      {/* Items Grid */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title="No products listed"
          description="Be the first to post a textbook, calculator, or dorm gear in this category!"
          actionText="Create Listing"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Link
              key={item.id}
              to={`/marketplace/${item.id}`}
              className="group glass-card rounded-2xl overflow-hidden border border-white/20 shadow-premium flex flex-col justify-between hover:scale-[1.01] hover:border-primary/20 transition-all text-left relative"
            >
              {/* Heart Wishlist */}
              <button
                onClick={(e) => handleWishlistToggle(item.id, e)}
                className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-100 dark:border-slate-800 shadow-md text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`w-4.5 h-4.5 ${wishlistIds.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <div className="flex flex-col">
                <img
                  src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary uppercase bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold">
                      👤 {item.seller?.profile?.name || 'Seller'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 dark:text-white group-hover:text-primary transition-colors text-base line-clamp-1">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex justify-between items-center border-t border-gray-100/50 dark:border-slate-800/40">
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">
                  ${item.price.toFixed(2)}
                </span>
                
                {item.seller?.profile?.marketplaceRating > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {item.seller.profile.marketplaceRating.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel border rounded-3xl p-6 shadow-premium flex flex-col gap-5 text-left relative animate-float">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Post Product Listing</h3>
              <p className="text-xs text-gray-400">Items will be visible to all verified student shoppers.</p>
            </div>

            <form onSubmit={handleCreateListing} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g. TI-84 Calculator"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="45.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="BOOKS">Books 📚</option>
                    <option value="ELECTRONICS">Electronics 💻</option>
                    <option value="STATIONERY">Stationery ✏️</option>
                    <option value="LAB_EQUIPMENT">Lab Equipment 🔬</option>
                    <option value="OTHERS">Others 🏷️</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Product Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Description *</label>
                <textarea
                  placeholder="Provide condition details, handoff location, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-premium transition-all disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'List Item Now ✨'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
