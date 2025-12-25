/* Cartculus Navbar Component
   Usage (vanilla):
     <div data-cartculus-navbar></div>
     <script src="/components/navbar.js"></script>
   Usage (React): load this script once (e.g., in index.html or via React Helmet), then render
     <div data-cartculus-navbar></div>
   Assumptions: Host page includes Bootstrap 5 CSS and bundle JS.
*/
(function () {
  const TEMPLATE = `
  <nav id="main-navbar" class="navbar fixed-top navbar-expand-sm" aria-label="Cartculus navbar" style="background-color: #f0f8ff;box-shadow:none;padding-top:0.75rem;padding-bottom:0.75rem;">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="https://cartculus.com/" aria-label="Cartculus home" style="margin-bottom:0;">
        <img src="./imgs/logo.png" id="navbar-logo" alt="Cartculus logo" style="height:24px;width:auto;display:block;">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample04"
        aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation" style="margin:0 0.5rem 0 0;padding:0.25rem 0.5rem;">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarsExample04">
        <ul class="navbar-nav me-auto mb-2 mb-md-0">
          <li class="nav-item"><a class="nav-link active" aria-current="page" href="https://cartculus.com/">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="https://play.cartculus.com/">Play Online</a></li>
          <li class="nav-item dropdown">
            <a id="navbar-about" class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">About</a>
            <ul class="dropdown-menu" style="background-color: #f0f8ff;">
              <li><a class="dropdown-item" href="https://cartculus.com/accessibility.html">Accessibility Statement</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;

  function mount(target) {
    if (!target) return;
    target.innerHTML = TEMPLATE;

    // After injecting, wire up behavior
    const navRoot = target.querySelector('#main-navbar');
    const navCollapse = target.querySelector('#navbarsExample04');
    const isReactHost = /play\.cartculus\.com$/i.test(location.hostname);
    const htmlElement = document.documentElement;

    // Ensure page content isn't hidden under fixed navbar
    function adjustBodyPadding() {
      const h = navRoot ? navRoot.getBoundingClientRect().height : 0;
      document.body.style.paddingTop = h ? h + 'px' : '';
    }
    // Only pad body when navbar is fixed (not on React host)
    if (!isReactHost) {
      // Ensure fixed-top class is present for main site
      if (navRoot) navRoot.classList.add('fixed-top');
      adjustBodyPadding();
      window.addEventListener('resize', adjustBodyPadding);
    } else {
      // On React host, let navbar scroll with page
      if (navRoot) navRoot.classList.remove('fixed-top');
      document.body.style.paddingTop = '';
    }

    // Enforce light theme across hosts
    function applyLightTheme() {
      htmlElement.setAttribute('data-bs-theme', 'light');
      document.body.style.backgroundColor = '#f0f8ff';
      htmlElement.style.backgroundColor = '#f0f8ff';
      if (navRoot) navRoot.style.backgroundColor = '#f0f8ff';
    }

    applyLightTheme();

    // Smooth scroll and collapse behavior for internal links
    const navLinks = navRoot.querySelectorAll('.nav-link:not(#navbar-about)');
    const dropdownItems = navRoot.querySelectorAll('.dropdown-item');

    const collapseNavbar = () => {
      if (!window.bootstrap || !navCollapse) return;
      const bsCollapse = new window.bootstrap.Collapse(navCollapse, { toggle: false });
      bsCollapse.hide();
    };

    function scrollToHashTarget(targetId) {
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const navbar = document.getElementById('main-navbar');
      const isFixed = navbar && navbar.classList.contains('fixed-top');
      const navbarHeight = isFixed ? (navbar ? navbar.getBoundingClientRect().height : 0) : 0;
      const rect = targetEl.getBoundingClientRect();
      const offset = rect.top + window.pageYOffset - navbarHeight - 8;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        const isHashLink = href && href.includes('#') && (new URL(href, location.origin)).origin === location.origin;
        const navIsExpanded = navCollapse && navCollapse.classList.contains('show');

        if (isHashLink) {
          const parts = href.split('#');
          const targetId = parts[1];
          event.preventDefault();

          if (!targetId) {
            if (navIsExpanded) {
              collapseNavbar();
              setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 350);
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
          }

          if (navIsExpanded) {
            collapseNavbar();
            setTimeout(() => { scrollToHashTarget(targetId); }, 350);
          } else {
            scrollToHashTarget(targetId);
          }
        } else {
          if (navIsExpanded) collapseNavbar();
        }
      });
    });

    dropdownItems.forEach((item) => {
      item.addEventListener('click', () => {
        const navIsExpanded = navCollapse && navCollapse.classList.contains('show');
        if (navIsExpanded) collapseNavbar();
      });
    });

    // Notify host page of enforced theme (light only)
    document.dispatchEvent(new CustomEvent('cartculus:themechange', { detail: { theme: 'light' } }));
  }

  function autoMount() {
    const placeholders = document.querySelectorAll('[data-cartculus-navbar]');
    placeholders.forEach((el) => mount(el));
  }

  // Expose API and auto-mount on DOMContentLoaded
  window.CartculusNavbar = { mount };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})();
