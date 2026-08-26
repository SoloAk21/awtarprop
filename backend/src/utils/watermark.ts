/**
 * Generates a large, light semi-transparent SVG watermark overlay centered on the target image.
 *
 * @param imageWidth - Width of base image in pixels
 * @param imageHeight - Height of base image in pixels
 * @returns Buffer containing the rendered SVG watermark
 */
export function generateWatermarkSvg(
  imageWidth: number,
  imageHeight: number,
): Buffer {
  // Scale watermark to 65% of image width (very big)
  const watermarkWidth = Math.max(280, Math.round(imageWidth * 0.65));
  const watermarkHeight = Math.round(watermarkWidth * 0.26);

  const fontSize = Math.round(watermarkHeight * 0.42);
  const subFontSize = Math.round(fontSize * 0.4);

  const svg = `
    <svg width="${watermarkWidth}" height="${watermarkHeight}" viewBox="0 0 ${watermarkWidth} ${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#059669" stop-opacity="0.22"/>
        </linearGradient>
      </defs>
      <g filter="url(#shadow)">
        <!-- Background Pill with low opacity (0.15) -->
        <rect 
          x="2" 
          y="2" 
          width="${watermarkWidth - 4}" 
          height="${watermarkHeight - 4}" 
          rx="${Math.round(watermarkHeight * 0.22)}" 
          fill="#0F172A" 
          fill-opacity="0.15" 
          stroke="#FFFFFF" 
          stroke-opacity="0.18" 
          stroke-width="1.5"
        />
        <!-- Centered Brand Text with low opacity (0.25) -->
        <text 
          x="${Math.round(watermarkWidth * 0.5)}" 
          y="${Math.round(watermarkHeight * 0.52)}" 
          text-anchor="middle"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${fontSize}" 
          font-weight="800" 
          fill="url(#brandGrad)" 
          letter-spacing="-0.5"
        >
          AwtarProp
        </text>
        <text 
          x="${Math.round(watermarkWidth * 0.5)}" 
          y="${Math.round(watermarkHeight * 0.8)}" 
          text-anchor="middle"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${subFontSize}" 
          font-weight="700" 
          fill="#FFFFFF" 
          fill-opacity="0.22" 
          letter-spacing="1"
        >
          VERIFIED MARKETPLACE
        </text>
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}
