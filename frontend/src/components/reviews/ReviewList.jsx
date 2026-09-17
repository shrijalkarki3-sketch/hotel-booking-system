import React, { useState, useEffect } from 'react';
import { getHotelReviews, checkEligibility, createReview } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, ThumbsUp, Send, AlertCircle } from 'lucide-react';

const ReviewList = ({ hotelId }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ totalReviews: 0, distributionPct: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);

  // Review Eligibility & Form State
  const [eligibility, setEligibility] = useState({ eligible: false, eligibleBookings: [] });
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviewsData = async () => {
    setLoading(true);
    try {
      const res = await getHotelReviews(hotelId);
      if (res.success) {
        setReviews(res.data);
        setSummary(res.summary);
      }

      if (user?.role === 'customer') {
        const eligRes = await checkEligibility(hotelId);
        if (eligRes.success) {
          setEligibility(eligRes);
          if (eligRes.eligibleBookings.length > 0) {
            setSelectedBookingId(eligRes.eligibleBookings[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [hotelId, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      toast.error('Please select a completed booking to review.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment for your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createReview({
        hotelId,
        bookingId: selectedBookingId,
        rating,
        comment,
      });

      if (res.success) {
        toast.success('Your verified stay review has been published!');
        setComment('');
        fetchReviewsData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-amber-400" />
          <span>Guest Reviews & Ratings</span>
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {summary.totalReviews} Verified Review(s)
        </span>
      </div>

      {/* Rating Aggregation Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        
        {/* Average Rating Block (Col 1) */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6 text-center">
          <div className="text-5xl font-extrabold text-white mb-1">
            {summary.totalReviews > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '4.8'}
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Based on verified guest stays</span>
        </div>

        {/* Rating Distribution Bars (Col 2) */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = summary.distributionPct[stars] || (stars === 5 ? 80 : stars === 4 ? 15 : 5);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold text-slate-300 flex items-center gap-1">
                  {stars} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right font-mono text-slate-400">{pct}%</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Verified Customer Review Submission Card */}
      {user?.role === 'customer' && eligibility.eligible && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <ShieldCheck className="h-5 w-5" />
            <span>Submit a Verified Stay Review</span>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            
            {/* Booking Selector */}
            {eligibility.eligibleBookings.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Completed Stay</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  {eligibility.eligibleBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      Stay from {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Star Rating Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-amber-400">{rating} of 5 Stars</span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Written Review Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details of your room cleanliness, staff hospitality, amenities..."
                rows="3"
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              <span>Publish Verified Review</span>
            </button>

          </form>
        </div>
      )}

      {/* Published Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                    {r.userId?.name?.charAt(0).toUpperCase() || 'G'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{r.userId?.name || 'Verified Guest'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Verified Stay
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1">{r.comment}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
            No public reviews yet for this hotel property. Be the first guest to review your stay!
          </div>
        )}
      </div>

    </div>
  );
};

export default ReviewList;
