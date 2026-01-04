/* ============================================
   Theme Module (Dark/Light Mode)
   ============================================ */
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    const html = document.documentElement;
    
    // Icons
    const MOON_ICON = 'bx-moon';
    const SUN_ICON = 'bx-sun';
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        html.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove(SUN_ICON);
            icon.classList.add(MOON_ICON);
        }
    }
    
    if (!themeToggle) return;
    
    // Handle toggle click
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        if (icon) {
            if (newTheme === 'dark') {
                icon.classList.remove(SUN_ICON);
                icon.classList.add(MOON_ICON);
            } else {
                icon.classList.remove(MOON_ICON);
                icon.classList.add(SUN_ICON);
            }
        }
        
        // Optional: Animate icon
        icon.style.transform = 'scale(0.5) rotate(90deg)';
        setTimeout(() => {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    });
}
