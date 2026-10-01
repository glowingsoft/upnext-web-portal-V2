export function getReviewerName(review = {}) {
  const customer = review.customer || review.user || review.reviewer || review.createdBy || {};
  const firstName = customer.firstName || customer.first_name || '';
  const lastName = customer.lastName || customer.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const reviewerAsString = typeof review.reviewer === 'string' ? review.reviewer : '';

  return (
    review.customerName ||
    review.reviewerName ||
    customer.name ||
    customer.fullName ||
    customer.basicInfo?.name ||
    fullName ||
    reviewerAsString ||
    'User'
  );
}

export function normalizeReview(review = {}) {
  const customerName = String(getReviewerName(review) || '');
  const customer = review.customer || review.user || review.reviewer || review.createdBy || {};

  return {
    ...review,
    _id: review._id || review.id,
    id: review.id || review._id,
    customerName,
    reviewer: customerName,
    reviewerAvatar: customer.profileIcon || customer.avatar || customer.image || '',
    customerInitial: review.customerInitial || customerName.charAt(0).toUpperCase() || 'U',
    rating: Number(review.rating || review.stars || 0),
    comment: review.comment || review.review || review.feedback || review.message || '',
    createdAt: review.createdAt || review.date || review.submittedAt || review.updatedAt,
    date: review.date || review.createdAt || review.submittedAt || review.updatedAt,
    status: review.status || 'pending',
  };
}

export function normalizeReviewStats(stats = {}, reviews = []) {
  const normalizedReviews = reviews.map(normalizeReview);
  const distribution = stats.distribution || stats.breakdown || {};
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: Number(distribution[star] || distribution[String(star)] || 0),
  }));
  const hasDistribution = ratingCounts.some((item) => item.count > 0);
  const fallbackCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: normalizedReviews.filter((review) => Math.round(Number(review.rating || 0)) === star).length,
  }));
  const counts = hasDistribution ? ratingCounts : fallbackCounts;
  const totalReviews = Number(stats.totalReviews ?? stats.total ?? normalizedReviews.length ?? 0);
  const averageRating = Number(stats.averageRating ?? stats.average ?? 0);
  const fallbackAverage = normalizedReviews.length
    ? normalizedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / normalizedReviews.length
    : 0;

  return {
    totalReviews,
    averageRating: averageRating || fallbackAverage,
    ratingCounts: counts,
    maxCount: Math.max(...counts.map((item) => item.count), 1),
  };
}
