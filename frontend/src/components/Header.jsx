/**
 * Replicates Zomato's top navigation bar:
 * - White bg, bottom border, sticky 64px
 * - Left:   SVG "zomato" wordmark in brand red
 * - Center: decorative search pill
 * - Right:  "CSAO Demo · Team Zomathon" tag
 */
export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-[#E8E8E8]"
      style={{ height: 64, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="h-full max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-4">

        {/* ── Left: Wordmark ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <svg
            width="110"
            height="28"
            viewBox="0 0 110 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Zomato"
          >
            <text
              x="0"
              y="22"
              fontFamily="'Inter', sans-serif"
              fontWeight="800"
              fontStyle="italic"
              fontSize="24"
              fill="#E23744"
              letterSpacing="-0.5"
            >
              zomato
            </text>
          </svg>
        </div>

        {/* ── Center: Search bar ─────────────────────────────────────────── */}
        <div className="flex-1 max-w-[480px] hidden sm:block">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{ background: '#F5F3F1', border: '1px solid #E8E8E8' }}
          >
            {/* Magnifier icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <circle cx="9" cy="9" r="6.5" stroke="#686B78" strokeWidth="1.8" />
              <path d="M14 14L18 18" stroke="#686B78" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span
              style={{
                color:    '#686B78',
                fontSize: 14,
                fontWeight: 400,
                userSelect: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Search for restaurants, cuisine or a dish
            </span>
          </div>
        </div>

        {/* ── Right: Demo tag ────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <span
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: '#F5F3F1', color: '#686B78', border: '1px solid #E8E8E8' }}
          >
            CSAO Demo · Team Zomathon
          </span>
        </div>

      </div>
    </header>
  )
}
