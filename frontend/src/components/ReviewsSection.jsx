import { RESTAURANT_REVIEWS } from '../data/mockData'

export default function ReviewsSection({ restaurantId }) {
  const data = RESTAURANT_REVIEWS[restaurantId]
  if (!data) {
    return (
      <div className="py-10 text-center text-[#686B78] text-[13px]">
        No reviews available for this restaurant.
      </div>
    )
  }

  const { summary, reviews } = data

  return (
    <div className="px-5 py-5 space-y-5">

      {/* Rating summary */}
      <div className="flex items-start gap-5">
        {/* Big score */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl"
            style={{ background: '#48C479' }}
          >
            <span className="text-white font-extrabold text-[22px] leading-none">
              {summary.average}
            </span>
            <StarIcon className="text-white" size={16} />
          </div>
          <p className="text-[11px] text-[#686B78] mt-1.5">
            {summary.total.toLocaleString()} ratings
          </p>
        </div>

        {/* Bar breakdown */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const key = ['one', 'two', 'three', 'four', 'five'][star - 1]
            const count = summary[key]
            const pct = Math.round((count / summary.total) * 100)
            return (
              <RatingBar key={star} star={star} pct={pct} count={count} />
            )
          })}
        </div>
      </div>

      <hr className="z-divider" />

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <ReviewCard key={idx} review={review} />
        ))}
      </div>
    </div>
  )
}

function RatingBar({ star, pct, count }) {
  const barColor = star >= 4 ? '#48C479' : star === 3 ? '#FFB800' : '#E23744'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-[#686B78] font-medium w-3 text-right">{star}</span>
      <StarIcon size={10} className="text-[#686B78]" />
      <div className="flex-1 h-2 rounded-full bg-[#F5F3F1] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <span className="text-[11px] text-[#686B78] w-8 text-right tabular-nums">{count}</span>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="border border-[#E8E8E8] rounded-xl p-4">
      {/* Header: name + rating + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#E23744] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
            {review.name.charAt(0)}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1C1C1C]">{review.name}</p>
            <p className="text-[11px] text-[#686B78]">{review.date}</p>
          </div>
        </div>
        {/* Rating pill */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md text-white text-[12px] font-bold flex-shrink-0"
          style={{ background: review.rating >= 4 ? '#48C479' : review.rating === 3 ? '#FFB800' : '#E23744' }}
        >
          {review.rating}
          <StarIcon size={10} className="text-white" />
        </div>
      </div>

      {/* Comment */}
      <p className="text-[13px] text-[#1C1C1C] leading-relaxed mt-3">
        {review.comment}
      </p>

      {/* Ordered items */}
      {review.orderedItems && review.orderedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {review.orderedItems.map(item => (
            <span
              key={item}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F3F1] text-[#686B78] border border-[#E8E8E8]"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function StarIcon({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" className={className}>
      <path d="M6 0.5l1.545 3.13 3.455.502-2.5 2.435.59 3.433L6 8.25l-3.09 1.75.59-3.433L1 4.132l3.455-.502L6 0.5z" />
    </svg>
  )
}
