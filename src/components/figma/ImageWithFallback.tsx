import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Helper function to normalize image URL (remove /api prefix for backward compatibility)
const normalizeImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return url
  // Replace /api/news/images/ with /news/images/ for backward compatibility
  return url.replace(/\/api\/news\/images\//g, '/news/images/')
}

// Helper function to replace image base URL with VITE_BACKEND_URL
// Upload: http://localhost:5000/news/images/file.jpg (disimpan di database)
// Display: https://scheduled-likes-ana-improvement.trycloudflare.com/news/images/file.jpg (dari VITE_BACKEND_URL)
// Note: External URLs (unsplash, etc) tidak akan di-replace
const replaceImageBaseUrl = (url: string | undefined): string | undefined => {
  if (!url) return url
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
  
  // Jika VITE_BACKEND_URL tidak diset, return URL asli
  if (!backendUrl) return url
  
  // Check jika URL sudah external (unsplash, dll) - skip replace
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      
      // Parse backendUrl untuk mendapatkan hostname-nya
      let backendHostname = ''
      try {
        const backendUrlObj = new URL(backendUrl)
        backendHostname = backendUrlObj.hostname
      } catch (e) {
        // Jika backendUrl tidak valid, skip
      }
      
      // Jika URL adalah external (bukan localhost dan bukan backend domain), return as is
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
      const isBackendDomain = backendHostname && hostname === backendHostname
      
      if (!isLocalhost && !isBackendDomain) {
        // External URL (unsplash, dll), jangan di-replace
        return url
      }
      
      // URL adalah internal (localhost atau backend domain), replace base URL
      const path = urlObj.pathname // /news/images/file.jpg
      
      // Remove /api dari backendUrl jika ada
      let baseUrl = backendUrl
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4) // Remove '/api'
      }
      
      // Combine backendUrl dengan path
      return `${baseUrl}${path}`
    } catch (error) {
      // Jika parsing error, return URL asli (mungkin format tidak standar)
      return url
    }
  }
  
  // Jika relative path (dimulai dengan /), combine dengan backendUrl
  if (url.startsWith('/')) {
    let baseUrl = backendUrl
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4)
    }
    return `${baseUrl}${url}`
  }
  
  // Jika bukan http/https dan bukan relative path, return as is
  return url
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props
  // Normalize URL (remove /api prefix) lalu replace base URL dengan VITE_BACKEND_URL
  const normalizedSrc = replaceImageBaseUrl(normalizeImageUrl(src))

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={normalizedSrc} />
      </div>
    </div>
  ) : (
    <img src={normalizedSrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
