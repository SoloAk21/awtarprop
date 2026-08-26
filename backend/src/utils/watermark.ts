/**
 * Generates an SVG watermark overlay dynamically scaled to the target image dimensions.
 *
 * @param imageWidth - Width of the base image in pixels
 * @param imageHeight - Height of the base image in pixels
 * @returns Buffer containing the rendered SVG watermark
 */
export function generateWatermarkSvg(
  imageWidth: number,
  imageHeight: number,
): Buffer {
  // Scale watermark to approximately 20% of image width (min 120px, max 320px)
  const watermarkWidth = Math.max(
    120,
    Math.min(320, Math.round(imageWidth * 0.2)),
  );
  const watermarkHeight = Math.round(watermarkWidth * 0.28);

  const fontSize = Math.round(watermarkHeight * 0.42);
  const subFontSize = Math.round(fontSize * 0.45);

  const svg = `
    <svg width="${watermarkWidth}" height="${watermarkHeight}" viewBox="0 0 ${watermarkWidth} ${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <g filter="url(#shadow)">
        <!-- Background Pill -->
        <rect 
          x="2" 
          y="2" 
          width="${watermarkWidth - 4}" 
          height="${watermarkHeight - 4}" 
          rx="${Math.round(watermarkHeight * 0.25)}" 
          fill="#0F172A" 
          fill-opacity="0.55" 
          stroke="#FFFFFF" 
          stroke-opacity="0.2" 
          stroke-width="1"
        />
        <!-- Brand Text -->
        <text 
          x="${Math.round(watermarkWidth * 0.12)}" 
          y="${Math.round(watermarkHeight * 0.52)}" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${fontSize}" 
          font-weight="800" 
          fill="url(#brandGrad)" 
          letter-spacing="-0.5"
        >
          AwtarProp
        </text>
        <text 
          x="${Math.round(watermarkWidth * 0.12)}" 
          y="${Math.round(watermarkHeight * 0.8)}" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${subFontSize}" 
          font-weight="600" 
          fill="#FFFFFF" 
          fill-opacity="0.85" 
          letter-spacing="0.5"
        >
          VERIFIED
        </text>
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}
