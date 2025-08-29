// Theme initialization script that runs before React hydration
// This prevents FOUC by applying cached theme colors immediately
export const themeInitScript = `
(function() {
  try {
    // Create color variations utility
    function createColorVariations(hexColor) {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const lighterColor = 'rgb(' + Math.min(255, r + 30) + ', ' + Math.min(255, g + 30) + ', ' + Math.min(255, b + 30) + ')';
      const darkerColor = 'rgb(' + Math.max(0, r - 30) + ', ' + Math.max(0, g - 30) + ', ' + Math.max(0, b - 30) + ')';
      
      return { lighterColor: lighterColor, darkerColor: darkerColor };
    }
    
    // Apply theme colors immediately
    function applyThemeColors(themeColor) {
      const root = document.documentElement;
      const variations = createColorVariations(themeColor);
      
      root.style.setProperty('--teamnl-orange', themeColor);
      root.style.setProperty('--teamnl-orange-light', variations.lighterColor);
      root.style.setProperty('--teamnl-orange-dark', variations.darkerColor);
      root.style.setProperty('--color-teamnl-orange', themeColor);
      root.style.setProperty('--color-teamnl-orange-light', variations.lighterColor);
      root.style.setProperty('--color-teamnl-orange-dark', variations.darkerColor);
    }
    
    // Check for cached theme color
    const cachedThemeColor = localStorage.getItem('narrowcasting_theme_color');
    if (cachedThemeColor) {
      applyThemeColors(cachedThemeColor);
    }
  } catch (error) {
    // Silent fail if localStorage is not available or script fails
    console.warn('Theme init script failed:', error);
  }
})();
`;
