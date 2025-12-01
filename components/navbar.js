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
  <nav id="main-navbar" class="navbar fixed-top navbar-expand-sm navbar-auto bg-auto" aria-label="Cartculus navbar">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center gap-2" href="https://cartculus.com/">
        <img src="https://cartculus.com/imgs/cclogo.png" id="navbar-logo" alt="navbar-logo" style="height:32px;width:auto;display:block;"> <span>Cartculus</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample04"
        aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarsExample04">
        <ul class="navbar-nav me-auto mb-2 mb-md-0">
          <li class="nav-item"><a class="nav-link active" aria-current="page" href="https://cartculus.com/#">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="https://cartculus.com/#how-to-play">How to play</a></li>
          <li class="nav-item"><a class="nav-link" href="https://play.cartculus.com/">Play Online</a></li>
          <li class="nav-item dropdown">
            <a id="navbar-about" class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">About</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Our story</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li>
        </ul>
        <div class="form-check form-switch text-light ms-auto">
          <input class="form-check-input" type="checkbox" id="themeToggle">
          <label class="form-check-label text-body" for="themeToggle">Dark Mode</label>
        </div>
      </div>
    </div>
  </nav>`;

  function mount(target) {
    if (!target) return;
    target.innerHTML = TEMPLATE;

    // After injecting, wire up behavior
    const navRoot = target.querySelector('#main-navbar');
    const navCollapse = target.querySelector('#navbarsExample04');

    // Ensure page content isn't hidden under fixed navbar
    function adjustBodyPadding() {
      const h = navRoot ? navRoot.getBoundingClientRect().height : 0;
      document.body.style.paddingTop = h ? h + 'px' : '';
    }
    adjustBodyPadding();
    window.addEventListener('resize', adjustBodyPadding);

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
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
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

    // Theme toggle behavior
    const themeToggle = navRoot.querySelector('#themeToggle');
    const htmlElement = document.documentElement;

    function applyTheme(theme) {
      htmlElement.setAttribute('data-bs-theme', theme);
      try { localStorage.setItem('theme', theme); } catch (_) {}
      if (themeToggle) themeToggle.checked = theme === 'light';
      const label = navRoot.querySelector('label[for="themeToggle"]');
      if (label) label.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';

      // Notify host page
      document.dispatchEvent(new CustomEvent('cartculus:themechange', { detail: { theme } }));

      // Update common host logo if present (best-effort)
      const mainLogo = document.getElementById('main-logo');
      if (mainLogo) {
        mainLogo.src = theme === 'light' ? 'https://cartculus.com/imgs/nobackgroundlogo-light.png' : 'https://cartculus.com/imgs/nobackgroundlogo.png';
      }
    }

    const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'dark';
    applyTheme(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        applyTheme(newTheme);
      });
    }
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
