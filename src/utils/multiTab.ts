// Open a page in a new tab
export const openInNewTab = (path: string) => {
  const baseUrl = window.location.origin;
  window.open(`${baseUrl}${path}`, '_blank', 'noopener,noreferrer');
};

// Open multiple tabs
export const openMultipleTabs = (paths: string[]) => {
  paths.forEach(path => openInNewTab(path));
};

// Share functionality URLs
export const getShareableUrl = (path: string, params?: Record<string, string>) => {
  const baseUrl = window.location.origin;
  const url = new URL(`${baseUrl}${path}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

// Copy URL to clipboard
export const copyUrlToClipboard = async (path: string, params?: Record<string, string>) => {
  try {
    const url = getShareableUrl(path, params);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
};