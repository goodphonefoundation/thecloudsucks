/**
 * Home Page Loading Animation
 * Inspired by modern landing pages with smooth transitions
 */

// Wait for DOM to be ready
document$.subscribe(function() {
  // Only run on home page
  if (!document.querySelector('.tcs-home')) {
    return;
  }

  // Elements
  const loadingText = document.getElementById('loadingText');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroButtons = document.getElementById('heroButtons');

  // Check if all elements exist
  if (!loadingText || !heroTitle || !heroSubtitle || !heroButtons) {
    return;
  }

  // Animation timing
  const LOADING_DURATION = 2000; // 2 seconds

  // Start the animation sequence
  setTimeout(() => {
    // Hide loading text
    loadingText.style.opacity = '0';
    loadingText.style.transform = 'translateY(-20px)';
    loadingText.style.transition = 'all 0.5s ease-out';

    setTimeout(() => {
      loadingText.style.display = 'none';

      // Show hero content
      heroTitle.style.display = 'block';
      heroSubtitle.style.display = 'block';
      heroButtons.style.display = 'flex';

      // Trigger animations (they're already defined in CSS)
      setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroSubtitle.style.opacity = '1';
        heroButtons.style.opacity = '1';
      }, 50);
    }, 500);
  }, LOADING_DURATION);
});

// Add smooth scroll behavior for anchor links
document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
