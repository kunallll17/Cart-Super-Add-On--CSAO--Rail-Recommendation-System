/**
 * FSSAI-style veg / non-veg indicator square.
 * Green square + dot = vegetarian.
 * Red square + dot  = non-vegetarian.
 */
export default function VegIndicator({ veg = true, size = 'md' }) {
  const dim = size === 'sm' ? '12px' : '14px'
  const dotDim = size === 'sm' ? '5px' : '7px'
  const color = veg ? '#60B246' : '#DB3A34'

  return (
    <span
      title={veg ? 'Vegetarian' : 'Non-vegetarian'}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          dim,
        height:         dim,
        border:         `1.5px solid ${color}`,
        borderRadius:   '3px',
        flexShrink:     0,
      }}
    >
      <span
        style={{
          width:        dotDim,
          height:       dotDim,
          borderRadius: '50%',
          background:   color,
          display:      'block',
        }}
      />
    </span>
  )
}
