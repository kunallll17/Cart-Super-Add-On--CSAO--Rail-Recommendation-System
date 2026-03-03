import { RESTAURANT_OVERVIEW } from '../data/mockData'

export default function OverviewSection({ restaurantId }) {
  const info = RESTAURANT_OVERVIEW[restaurantId]
  if (!info) {
    return (
      <div className="py-10 text-center text-[#686B78] text-[13px]">
        No overview available for this restaurant.
      </div>
    )
  }

  return (
    <div className="px-5 py-5 space-y-6">

      {/* About */}
      <div>
        <SectionTitle>About this place</SectionTitle>
        <p className="text-[13px] text-[#1C1C1C] leading-relaxed mt-2">{info.about}</p>
      </div>

      {/* Known For */}
      <div>
        <SectionTitle>Known For</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {info.knownFor.map(item => (
            <span
              key={item}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFF0F1] text-[#E23744] border border-[#FCDCDF]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <hr className="z-divider" />

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow icon={<ClockIcon />} label="Timings" value={info.timings} />
        <InfoRow icon={<MapPinIcon />} label="Address" value={info.address} />
        <InfoRow icon={<PhoneIcon />} label="Phone" value={info.phone} />
        <InfoRow
          icon={<CurrencyIcon />}
          label="Cost for Two"
          value={`Rs. ${info.costForTwo}`}
        />
      </div>

      <hr className="z-divider" />

      {/* Cuisines */}
      <div>
        <SectionTitle>Cuisines</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {info.cuisines.map(c => (
            <span
              key={c}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#F5F3F1] text-[#686B78] border border-[#E8E8E8]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Payment modes */}
      <div>
        <SectionTitle>Payment Modes</SectionTitle>
        <p className="text-[13px] text-[#686B78] mt-1.5">
          {info.paymentModes.join(' · ')}
        </p>
      </div>

      {/* Safety */}
      <div>
        <SectionTitle>Safety Measures</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {info.safetyMeasures.map(m => (
            <span
              key={m}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#F0FBF0] text-[#48C479] border border-[#D4EDDA]"
            >
              <CheckCircle />
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 className="text-[15px] font-bold text-[#1C1C1C]">{children}</h3>
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#686B78] flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[12px] text-[#686B78] font-medium">{label}</p>
        <p className="text-[13px] text-[#1C1C1C] mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.5V10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M3 4.5C3 3.67 3.67 3 4.5 3H7l1.5 4-2 1.5a10 10 0 005 5L13 11.5l4 1.5v2.5c0 .83-.67 1.5-1.5 1.5A14.5 14.5 0 013 4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7.5h6M7 10h6M8.5 7.5v5.5M11.5 7.5v5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
