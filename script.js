/**
 * Portfolio Interactive Scripts for Vedashri Prabhakar Gavali
 * Features:
 * 1. Theme Switcher (Dark / Light with localStorage persistence)
 * 2. Mobile Navigation Drawer & Hamburger Animation
 * 3. Typewriter Animation in Hero Section
 * 4. Resume CV Download / Print Trigger
 * 5. Interactive Animated Skill Proficiency Meters (IntersectionObserver)
 * 6. Project Category Filtering with Smooth Transitions
 * 7. Project Architecture Detail Modal
 * 8. Scrollspy Active Link Highlighting
 * 9. Sticky Header Effect & Floating Back to Top Button
 * 10. Contact Form Submission Toast Notification
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // REACT-INSPIRED MICRO-HOOK RUNTIME (useState & useEffect)
  // Powers live reactive portfolio side-effects in pure Vanilla JavaScript
  // ==========================================================================
  const ReactRuntime = (() => {
    let contextCounter = 0;

    function createContext(defaultValue) {
      let currentValue = defaultValue;
      const subscribers = new Set();

      return {
        _isContext: true,
        _id: ++contextCounter,
        get() {
          return currentValue;
        },
        set(newValue) {
          const nextVal = typeof newValue === 'function' ? newValue(currentValue) : newValue;
          if (!Object.is(currentValue, nextVal)) {
            currentValue = nextVal;
            subscribers.forEach(cb => {
              try { cb(currentValue); } catch (e) { console.error('[Context subscriber error]', e); }
            });
          }
        },
        subscribe(cb) {
          subscribers.add(cb);
          return () => subscribers.delete(cb);
        }
      };
    }

    function createScope(renderFn) {
      let hooks = [];
      let currentHook = 0;
      let registeredEffects = [];
      const contextSubscriptions = new Set();

      function useState(initialValue) {
        const hookIndex = currentHook;
        if (hooks[hookIndex] === undefined) {
          hooks[hookIndex] = typeof initialValue === 'function' ? initialValue() : initialValue;
        }
        const setState = (newValue) => {
          const nextValue = typeof newValue === 'function' ? newValue(hooks[hookIndex]) : newValue;
          if (!Object.is(hooks[hookIndex], nextValue)) {
            hooks[hookIndex] = nextValue;
            rerender();
          }
        };
        return [hooks[currentHook++], setState];
      }

      function useEffect(callback, depArray) {
        const hookIndex = currentHook;
        const prevHook = hooks[hookIndex];
        const hasNoDeps = !depArray;
        const hasChangedDeps = prevHook ? !depArray.every((el, i) => Object.is(el, prevHook.deps[i])) : true;

        registeredEffects.push({
          hookIndex,
          callback,
          depArray,
          hasNoDeps,
          hasChangedDeps,
          prevCleanup: prevHook?.cleanup
        });
        currentHook++;
      }

      function useContext(context) {
        if (!context || !context._isContext) {
          throw new Error('useContext must be called with a valid context created by ReactRuntime.createContext');
        }
        const hookIndex = currentHook;
        if (hooks[hookIndex] === undefined) {
          hooks[hookIndex] = context.get();
          const unsubscribe = context.subscribe((newVal) => {
            hooks[hookIndex] = newVal;
            rerender();
          });
          contextSubscriptions.add(unsubscribe);
        }
        currentHook++;
        return context.get();
      }

      function runEffects() {
        registeredEffects.forEach(effect => {
          if (effect.hasNoDeps || effect.hasChangedDeps) {
            if (typeof effect.prevCleanup === 'function') {
              try {
                effect.prevCleanup();
              } catch (err) {
                console.warn('[useEffect cleanup error]', err);
              }
            }
            const cleanup = effect.callback();
            hooks[effect.hookIndex] = {
              deps: effect.depArray,
              cleanup: typeof cleanup === 'function' ? cleanup : undefined
            };
          }
        });
      }

      function rerender() {
        currentHook = 0;
        registeredEffects = [];
        renderFn({ useState, useEffect, useContext });
        runEffects();
      }

      rerender();
      return { 
        rerender,
        destroy() {
          contextSubscriptions.forEach(unsub => unsub());
          contextSubscriptions.clear();
        }
      };
    }

    return { createScope, createContext };
  })();

  // --------------------------------------------------------------------------
  // HOOK LIFECYCLE 1: useDocumentTitle (Visibility & Smart Tab Retention)
  // --------------------------------------------------------------------------
  ReactRuntime.createScope(({ useState, useEffect }) => {
    const originalTitle = 'Vedashri Prabhakar Gavali | Portfolio';
    const awayTitle = '👋 Come back! Check my projects | Vedashri Gavali';
    const [isAway, setIsAway] = useState(false);

    useEffect(() => {
      const handleVisibilityChange = () => setIsAway(document.hidden);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
      document.title = isAway ? awayTitle : originalTitle;
    }, [isAway]);
  });

  // --------------------------------------------------------------------------
  // HOOK LIFECYCLE 2: useMagneticPhysics (Spring-Mass Inertia Physics Hook)
  // Attaches interactive magnetic force fields to buttons, tags & badges
  // --------------------------------------------------------------------------
  ReactRuntime.createScope(({ useEffect }) => {
    useEffect(() => {
      const magneticTargets = document.querySelectorAll(
        '.btn-primary, .btn-secondary, .brand-initials, .role-pill-btn, .theme-toggle, .ai-chat-launcher'
      );

      const cleanups = [];

      magneticTargets.forEach(el => {
        let isHovered = false;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let rafId = null;

        const onMouseMove = (e) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

          if (dist < 75) {
            isHovered = true;
            targetX = (e.clientX - centerX) * 0.28;
            targetY = (e.clientY - centerY) * 0.28;
          } else {
            isHovered = false;
            targetX = 0;
            targetY = 0;
          }
        };

        const updatePhysics = () => {
          // Spring damping formula
          currentX += (targetX - currentX) * 0.16;
          currentY += (targetY - currentY) * 0.16;

          if (Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05 || isHovered) {
            el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
          } else {
            el.style.transform = '';
          }

          rafId = requestAnimationFrame(updatePhysics);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        rafId = requestAnimationFrame(updatePhysics);

        cleanups.push(() => {
          window.removeEventListener('mousemove', onMouseMove);
          if (rafId) cancelAnimationFrame(rafId);
          el.style.transform = '';
        });
      });

      return () => {
        cleanups.forEach(fn => fn());
      };
    }, []);
  });

  // ==========================================================================
  // GLOBAL CONTEXT API STORES (ThemeContext, ToastContext & RouterContext)
  // Shared reactive state stores that eliminate prop-drilling across the app
  // ==========================================================================
  const ThemeContext = ReactRuntime.createContext({
    theme: localStorage.getItem('vg_portfolio_theme') || 'dark',
    toggleTheme: () => {}
  });

  const ToastContext = ReactRuntime.createContext({
    showToast: (message, type = 'info', icon = '') => {}
  });

  const RouterContext = ReactRuntime.createContext({
    currentRoute: '#/',
    viewMode: 'all',
    navigate: (route) => {},
    setViewMode: (mode) => {}
  });

  // --------------------------------------------------------------------------
  // CONTEXT PROVIDER 1: ThemeContextProvider
  // --------------------------------------------------------------------------
  ReactRuntime.createScope(({ useState, useEffect }) => {
    const htmlRoot = document.documentElement;
    const initialTheme = localStorage.getItem('vg_portfolio_theme') || 'dark';
    const [theme, setTheme] = useState(initialTheme);
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

    useEffect(() => {
      if (theme === 'light') {
        htmlRoot.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
      } else {
        htmlRoot.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
      }
      try {
        localStorage.setItem('vg_portfolio_theme', theme);
      } catch (e) {}

      ThemeContext.set({
        theme,
        toggleTheme: () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
      });
    }, [theme]);

    useEffect(() => {
      if (!themeToggle) return;
      const onToggle = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
      themeToggle.addEventListener('click', onToggle);
      return () => themeToggle.removeEventListener('click', onToggle);
    }, [themeToggle]);
  });

  // --------------------------------------------------------------------------
  // CONTEXT PROVIDER 2: ToastContextProvider
  // --------------------------------------------------------------------------
  ReactRuntime.createScope(({ useEffect }) => {
    const toastEl = document.getElementById('toast-notification');
    const messageEl = document.getElementById('toast-message');
    const iconEl = toastEl ? toastEl.querySelector('.toast-icon') : null;
    let timerId = null;

    const showToast = (message, type = 'info', icon = '') => {
      if (!toastEl || !messageEl) return;
      if (timerId) clearTimeout(timerId);

      const defaultIcon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '✨';
      if (iconEl) iconEl.textContent = icon || defaultIcon;
      messageEl.textContent = message;

      toastEl.classList.remove('toast-success', 'toast-warning', 'toast-info');
      toastEl.classList.add(`toast-${type}`);
      toastEl.classList.add('active');

      timerId = setTimeout(() => {
        toastEl.classList.remove('active');
      }, 3200);
    };

    useEffect(() => {
      ToastContext.set({ showToast });
      window.showToast = showToast;
    }, []);
  });

  // --------------------------------------------------------------------------
  // CONTEXT PROVIDER 3 & HOOK: useSpaRouter (Client-Side Routing & View Engine)
  // --------------------------------------------------------------------------
  const ROUTES_MAP = {
    '#/': { name: 'Home', sectionId: 'hero', icon: '🏠', subtitle: 'Overview & Full Showcase' },
    '#/about': { name: 'About', sectionId: 'about', icon: '👤', subtitle: 'Bio, Acumen & Core Philosophies' },
    '#/education': { name: 'Education', sectionId: 'education', icon: '🎓', subtitle: 'B.Tech & Academic Track Record' },
    '#/skills': { name: 'Skills', sectionId: 'skills', icon: '⚡', subtitle: 'Full-Stack & Hardware Matrix' },
    '#/projects': { name: 'Projects', sectionId: 'projects', icon: '📂', subtitle: 'Production Systems & Repositories' },
    '#/experience': { name: 'Experience', sectionId: 'experience', icon: '💼', subtitle: 'Internships & Milestones' },
    '#/certifications': { name: 'Certifications', sectionId: 'certifications', icon: '📜', subtitle: 'Verified Credentials & Badges' },
    '#/contact': { name: 'Contact', sectionId: 'contact', icon: '✉️', subtitle: 'Direct Inquiries & Hiring' }
  };

  ReactRuntime.createScope(({ useState, useEffect }) => {
    const routerBarEl = document.getElementById('spa-router-bar');

    const parseHash = () => {
      const hash = window.location.hash || '#/';
      if (hash.startsWith('#') && !hash.startsWith('#/')) {
        const candidate = `#/${hash.slice(1)}`;
        if (ROUTES_MAP[candidate]) return candidate;
      }
      return ROUTES_MAP[hash] ? hash : '#/';
    };

    const [currentRoute, setCurrentRoute] = useState(parseHash);
    const [viewMode, setViewMode] = useState(() => {
      try {
        return sessionStorage.getItem('vg_spa_view_mode') || 'all';
      } catch (e) {
        return 'all';
      }
    });

    // Hash listener (Browser Back/Forward navigation)
    useEffect(() => {
      const handleHashChange = () => {
        const next = parseHash();
        setCurrentRoute(next);
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Sync RouterContext store
    useEffect(() => {
      RouterContext.set({
        currentRoute,
        viewMode,
        navigate: (path) => {
          window.location.hash = path;
        },
        setViewMode: (mode) => {
          try { sessionStorage.setItem('vg_spa_view_mode', mode); } catch (e) {}
          setViewMode(mode);
        }
      });
    }, [currentRoute, viewMode]);

    // Apply route and viewMode side effects
    useEffect(() => {
      const routeInfo = ROUTES_MAP[currentRoute] || ROUTES_MAP['#/'];
      const targetSection = document.getElementById(routeInfo.sectionId);

      if (viewMode === 'focused' && currentRoute !== '#/') {
        document.body.classList.add('spa-focused-mode');
        document.querySelectorAll('main > section[id]').forEach(sec => {
          if (sec.id === routeInfo.sectionId) {
            sec.classList.add('spa-active-route');
          } else {
            sec.classList.remove('spa-active-route');
          }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        document.body.classList.remove('spa-focused-mode');
        document.querySelectorAll('main > section[id]').forEach(sec => {
          sec.classList.remove('spa-active-route');
        });
        if (targetSection && (currentRoute !== '#/' || window.scrollY > 150)) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      // Update navbar links active state
      document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === currentRoute || (href === '#/' && currentRoute === '#/');
        link.classList.toggle('active', isActive);
      });
    }, [currentRoute, viewMode]);

    // Render the SPA Router Controller Bar
    if (routerBarEl) {
      const routeInfo = ROUTES_MAP[currentRoute] || ROUTES_MAP['#/'];
      routerBarEl.innerHTML = `
        <div class="spa-router-container">
          <div class="spa-route-breadcrumbs">
            <span class="spa-router-badge">🧭 SPA Router</span>
            <span class="breadcrumb-separator">/</span>
            <a href="#/" class="breadcrumb-item ${currentRoute === '#/' ? 'active' : ''}">
              <span class="breadcrumb-icon">🏠</span> Home
            </a>
            ${currentRoute !== '#/' ? `
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item active">
                <span class="breadcrumb-icon">${routeInfo.icon}</span> ${routeInfo.name}
              </span>
            ` : ''}
            <span class="route-subtitle-pill">${routeInfo.subtitle}</span>
          </div>

          <div class="spa-mode-switch-group">
            <span class="mode-switch-label">View:</span>
            <div class="spa-mode-pills" role="radiogroup" aria-label="SPA View Mode">
              <button type="button" 
                      class="spa-mode-btn ${viewMode === 'all' ? 'active' : ''}" 
                      id="spa-mode-all" 
                      title="Fluid long-scroll through all sections">
                <span>📜 All Sections</span>
              </button>
              <button type="button" 
                      class="spa-mode-btn ${viewMode === 'focused' ? 'active' : ''}" 
                      id="spa-mode-focused" 
                      title="Focus on active route only like a single-page app">
                <span>🎯 Page Mode</span>
              </button>
            </div>
          </div>
        </div>
      `;

      const btnAll = document.getElementById('spa-mode-all');
      const btnFocused = document.getElementById('spa-mode-focused');

      if (btnAll) {
        btnAll.addEventListener('click', () => {
          try { sessionStorage.setItem('vg_spa_view_mode', 'all'); } catch (e) {}
          setViewMode('all');
          if (typeof window.showToast === 'function') {
            window.showToast('📜 All Sections Flow Active', 'info', '📜');
          }
        });
      }

      if (btnFocused) {
        btnFocused.addEventListener('click', () => {
          try { sessionStorage.setItem('vg_spa_view_mode', 'focused'); } catch (e) {}
          setViewMode('focused');
          if (typeof window.showToast === 'function') {
            window.showToast(`🎯 Page Mode: Viewing ${routeInfo.name}`, 'info', '🎯');
          }
        });
      }
    }
  });

  // --------------------------------------------------------------------------
  // 2. MOBILE NAVIGATION DRAWER
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('open');
      toggleMenu(!isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  function toggleMenu(open) {
    if (!mobileToggle || !navMenu) return;
    if (open) {
      navMenu.classList.add('open');
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    } else {
      navMenu.classList.remove('open');
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // --------------------------------------------------------------------------
  // 3. DYNAMIC TYPEWRITER EFFECT IN HERO
  // --------------------------------------------------------------------------
  const typewriterElement = document.getElementById('typewriter-text');
  if (typewriterElement) {
    const roles = [
      'Full-Stack Software Engineer',
      'Java & Spring Boot Developer',
      'Electronics & VLSI Engineer',
      'React & Frontend Enthusiast',
      'IoT & Embedded Systems Explorer'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 90;
    const deletingSpeed = 45;
    const pauseDelay = 1800;

    function typeEffect() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        charIndex--;
        typewriterElement.textContent = currentRole.substring(0, charIndex);
      } else {
        charIndex++;
        typewriterElement.textContent = currentRole.substring(0, charIndex);
      }

      let timeoutDuration = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentRole.length) {
        timeoutDuration = pauseDelay;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        timeoutDuration = 400;
      }

      setTimeout(typeEffect, timeoutDuration);
    }

    typeEffect();
  }

  // --------------------------------------------------------------------------
  // 4. RESUME LINK INITIALIZATION (Opens dedicated resume.html)
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // 5. ANIMATED SKILL PROFICIENCY METERS
  // --------------------------------------------------------------------------
  const skillsMetersContainer = document.getElementById('skills-meters');
  const skillMeters = document.querySelectorAll('.skill-meter');

  if (skillsMetersContainer && skillMeters.length > 0) {
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          skillMeters.forEach(meter => {
            const target = parseInt(meter.getAttribute('data-target'), 10) || 80;
            const fillBar = meter.querySelector('.meter-fill');
            const percentSpan = meter.querySelector('.meter-percentage');

            if (fillBar) {
              fillBar.style.width = `${target}%`;
            }

            // Animate number count up
            let current = 0;
            const increment = target / 40;
            const counter = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(counter);
              }
              if (percentSpan) {
                percentSpan.textContent = `${Math.round(current)}%`;
              }
            }, 30);
          });
        }
      });
    }, { threshold: 0.25 });

    observer.observe(skillsMetersContainer);
  }

  // --------------------------------------------------------------------------
  // 6. PROJECT CATEGORY FILTERING
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const categories = card.getAttribute('data-category') || '';
          if (filterValue === 'all' || categories.includes(filterValue)) {
            card.classList.remove('is-hidden');
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            }, 40);
          } else {
            card.classList.add('is-hidden');
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. PROJECT ARCHITECTURE MODAL
  // --------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const projectDetailsMap = {
    'course-mgmt': {
      title: 'Student Course Management System — Technical Architecture',
      content: `
        <p><strong>System Overview:</strong> A robust, enterprise-inspired full-stack web application designed for role-based student course management, grade tracking, and instructor coordination.</p>
        <p><strong>Backend Architecture:</strong></p>
        <ul>
          <li><strong>Controller Layer:</strong> RESTful API endpoints handling course enrollment, grade queries, and authentication.</li>
          <li><strong>Service Layer:</strong> Core Java business logic ensuring prerequisite validation, capacity checks, and transactional integrity.</li>
          <li><strong>Data Layer:</strong> Spring Data JPA repository pattern interfacing with MySQL relational schema.</li>
        </ul>
        <p><strong>Frontend Interface:</strong> Component-driven React.js dashboard utilizing hooks (useState, useEffect) for state synchronization, dynamic course search, and responsive tabular views.</p>
      `
    },
    'alumni-mgmt': {
      title: 'Alumni Management System — Technical Architecture',
      content: `
        <p><strong>System Overview:</strong> Centralized web hub designed for alumni verification, networking broadcasts, event registration, and student mentorship scheduling.</p>
        <p><strong>Architecture Highlights:</strong></p>
        <ul>
          <li><strong>Python Backend Engine:</strong> Modular request handlers processing form submissions, event broadcasts, and authentication workflows.</li>
          <li><strong>Relational Schema:</strong> Normalized MySQL database managing alumni profiles, graduation cohorts, and job postings.</li>
          <li><strong>Client Layer:</strong> Accessible, lightweight HTML5/CSS3/JavaScript frontend optimized for fast mobile rendering.</li>
        </ul>
      `
    },
    'krishi-connect': {
      title: 'Krishi Connect AgriTech Platform — Technical Architecture',
      content: `
        <p><strong>System Overview:</strong> An impact-driven digital agri-platform empowering rural farmers with agricultural advisory, government policy notices, and direct marketplace prices.</p>
        <p><strong>Architecture Highlights:</strong></p>
        <ul>
          <li><strong>Information Pipeline:</strong> Python backend querying structured crop advisory data and fertilizer recommendations.</li>
          <li><strong>Database Persistence:</strong> MySQL schema organizing agricultural product catalogs, market vendors, and advisory updates.</li>
          <li><strong>Inclusive UI:</strong> Mobile-first interface designed with high contrast and intuitive navigation for accessibility across diverse user backgrounds.</li>
        </ul>
      `
    }
  };

  const demoButtons = document.querySelectorAll('.project-btn-demo');
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsMap[projKey];
      if (data && projectModal && modalTitle && modalBody) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        projectModal.showModal();
      }
    });
  });

  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', () => {
      projectModal.close();
    });

    // Close when clicking modal backdrop
    projectModal.addEventListener('click', (e) => {
      const rect = projectModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        projectModal.close();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7B. INTERACTIVE PROJECT SOURCE CODE INSPECTOR MODAL
  // --------------------------------------------------------------------------
  const codeModal = document.getElementById('code-modal');
  const codeModalTitle = document.getElementById('code-modal-title');
  const codeTabsBar = document.getElementById('code-tabs-bar');
  const codeLangBadge = document.getElementById('code-lang-badge');
  const codeFilePath = document.getElementById('code-file-path');
  const codeDisplay = document.getElementById('code-display');
  const codeModalDesc = document.getElementById('code-modal-desc');
  const codeModalClose = document.getElementById('code-modal-close');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const copyBtnText = document.getElementById('copy-btn-text');
  const codeGithubLink = document.getElementById('code-github-link');

  let currentProjectCode = null;
  let activeFileIndex = 0;

  const projectSourceRepository = {
    'course-mgmt': {
      title: 'Student Course Management System — Source Code Repository',
      github: 'https://github.com/vedashri-gavali',
      desc: 'Enterprise Core Java & Spring Boot MVC architecture with RESTful services and relational MySQL schema.',
      files: [
        {
          name: 'CourseController.java',
          path: 'src/main/java/com/vedashri/controller/CourseController.java',
          lang: 'JAVA',
          code: `package com.vedashri.coursemanagement.controller;

import com.vedashri.coursemanagement.model.Course;
import com.vedashri.coursemanagement.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.findAllCourses());
    }

    @PostMapping("/enroll/{courseId}/student/{studentId}")
    public ResponseEntity<String> enrollStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        courseService.enrollStudent(courseId, studentId);
        return ResponseEntity.ok("Student enrolled successfully.");
    }
}`
        },
        {
          name: 'StudentService.java',
          path: 'src/main/java/com/vedashri/service/StudentService.java',
          lang: 'JAVA',
          code: `package com.vedashri.coursemanagement.service;

import com.vedashri.coursemanagement.model.Student;
import com.vedashri.coursemanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Transactional
    public Student registerStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new IllegalArgumentException("Student email already registered.");
        }
        return studentRepository.save(student);
    }

    @Transactional(readOnly = true)
    public Student getStudentProfile(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student record not found: " + studentId));
    }
}`
        },
        {
          name: 'schema.sql',
          path: 'src/main/resources/schema.sql',
          lang: 'SQL',
          code: `-- Student Course Management System Database DDL
CREATE TABLE students (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cgpa DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(15) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    capacity INT DEFAULT 60
);

CREATE TABLE enrollments (
    enrollment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_date DATE NOT NULL,
    grade VARCHAR(2),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT
);`
        }
      ]
    },
    'alumni-mgmt': {
      title: 'Alumni Management System — Source Code Repository',
      github: 'https://github.com/vedashri-gavali',
      desc: 'Python Flask REST API routing engine with connection-pooled MySQL persistence layer.',
      files: [
        {
          name: 'app.py',
          path: 'backend/app.py',
          lang: 'PYTHON',
          code: `"""
Alumni Management System - Backend REST API Engine
Author: Vedashri Prabhakar Gavali
"""
from flask import Flask, request, jsonify
from db_pool import get_db_connection
import mysql.connector

app = Flask(__name__)

@app.route('/api/alumni', methods=['GET'])
def get_alumni_directory():
    batch = request.args.get('batch')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if batch:
        cursor.execute("SELECT id, name, email, batch, company, role FROM alumni WHERE batch = %s", (batch,))
    else:
        cursor.execute("SELECT id, name, email, batch, company, role FROM alumni ORDER BY batch DESC LIMIT 50")
        
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"status": "success", "count": len(records), "data": records})

@app.route('/api/events/register', methods=['POST'])
def register_event():
    payload = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO event_attendees (event_id, alumni_id, registered_at) VALUES (%s, %s, NOW())",
        (payload['event_id'], payload['alumni_id'])
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Event registration confirmed"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)`
        },
        {
          name: 'schema.sql',
          path: 'database/schema.sql',
          lang: 'SQL',
          code: `-- Relational Schema for Alumni Network Hub
CREATE TABLE alumni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    batch YEAR NOT NULL,
    degree VARCHAR(80) NOT NULL,
    company VARCHAR(100),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alumni_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    event_date DATETIME NOT NULL,
    location VARCHAR(120) NOT NULL,
    description TEXT
);`
        }
      ]
    },
    'krishi-connect': {
      title: 'Krishi Connect AgriTech — Source Code Repository',
      github: 'https://github.com/vedashri-gavali',
      desc: 'Python advisory computation engine delivering real-time mandi prices and agricultural recommendations.',
      files: [
        {
          name: 'advisory_engine.py',
          path: 'services/advisory_engine.py',
          lang: 'PYTHON',
          code: `"""
Krishi Connect - AgriTech Market Price & Weather Advisory Engine
Author: Vedashri Prabhakar Gavali
"""
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class MarketAdvisory:
    crop: str
    mandi: str
    price_per_quintal: float
    trend: str

class KrishiAdvisoryEngine:
    def __init__(self, region: str = "Maharashtra"):
        self.region = region

    def get_realtime_mandi_rates(self, crop_name: str) -> Dict:
        rates = {
            "Wheat": MarketAdvisory("Wheat", "Chhatrapati Sambhajinagar APMC", 2450.0, "Rising"),
            "Cotton": MarketAdvisory("Cotton", "Jalna Mandi", 7200.0, "Stable"),
            "Soybean": MarketAdvisory("Soybean", "Latur APMC", 4650.0, "Bullish")
        }
        advisory = rates.get(crop_name)
        if advisory:
            return {
                "crop": advisory.crop,
                "mandi": advisory.mandi,
                "price": advisory.price_per_quintal,
                "trend": advisory.trend
            }
        return {"error": "Crop not found in regional registry"}`
        },
        {
          name: 'app.py',
          path: 'app.py',
          lang: 'PYTHON',
          code: `from flask import Flask, jsonify
from services.advisory_engine import KrishiAdvisoryEngine

app = Flask(__name__)
engine = KrishiAdvisoryEngine(region="Maharashtra")

@app.route('/api/krishi/rates/<crop>', methods=['GET'])
def get_rate(crop):
    return jsonify(engine.get_realtime_mandi_rates(crop))

if __name__ == '__main__':
    app.run(port=8080)`
        }
      ]
    }
  };

  // Syntax Highlighting Engine
  function highlightCode(rawCode, lang) {
    let escaped = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (lang === 'JAVA') {
      escaped = escaped
        .replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>')
        .replace(/(@\w+)/g, '<span class="tok-ann">$1</span>')
        .replace(/\b(package|import|public|private|protected|class|interface|final|return|new|throw|void|static|extends|implements)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/\b(String|Long|List|ResponseEntity|CourseService|StudentService|CourseRepository|StudentRepository|Student|Course|int|boolean)\b/g, '<span class="tok-cls">$1</span>')
        .replace(/(".*?")/g, '<span class="tok-str">$1</span>');
    } else if (lang === 'PYTHON') {
      escaped = escaped
        .replace(/(#[^\n]*)/g, '<span class="tok-com">$1</span>')
        .replace(/("""[\s\S]*?""")/g, '<span class="tok-com">$1</span>')
        .replace(/(@\w+)/g, '<span class="tok-ann">$1</span>')
        .replace(/\b(def|class|return|from|import|if|else|elif|in|and|or|not|None|True|False|self)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="tok-str">$1</span>')
        .replace(/\b(Flask|request|jsonify|MarketAdvisory|KrishiAdvisoryEngine|Dict|List|str|float)\b/g, '<span class="tok-cls">$1</span>');
    } else if (lang === 'SQL') {
      escaped = escaped
        .replace(/(--[^\n]*)/g, '<span class="tok-com">$1</span>')
        .replace(/\b(CREATE|TABLE|BIGINT|INT|VARCHAR|DECIMAL|TIMESTAMP|PRIMARY|KEY|AUTO_INCREMENT|NOT|NULL|UNIQUE|DEFAULT|CURRENT_TIMESTAMP|FOREIGN|REFERENCES|ON|DELETE|CASCADE|RESTRICT|YEAR|DATETIME|TEXT)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="tok-str">$1</span>');
    } else if (lang === 'JAVASCRIPT') {
      escaped = escaped
        .replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>')
        .replace(/\b(import|export|from|function|return|const|let|var|if|else|try|catch|finally|throw|new|async|await|default|null|true|false)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/\b(useState|useEffect|useCallback|useMemo|useRef|useTheme|useTypewriter|useFormWebhook|useIntersectionObserver|Promise|Error|Date|JSON)\b/g, '<span class="tok-cls">$1</span>')
        .replace(/(`.*?`|'.*?'|".*?")/g, '<span class="tok-str">$1</span>');
    }

    return escaped;
  }

  function renderCodeFile(index) {
    if (!currentProjectCode || !currentProjectCode.files[index]) return;
    activeFileIndex = index;
    const file = currentProjectCode.files[index];

    // Update active tab UI
    const tabBtns = codeTabsBar.querySelectorAll('.code-tab-btn');
    tabBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // Update meta bar
    codeLangBadge.textContent = file.lang;
    codeFilePath.textContent = file.path;
    codeDisplay.innerHTML = highlightCode(file.code, file.lang);
  }

  // Open Code Modal on Button Click
  const codeButtons = document.querySelectorAll('.project-btn-code');
  codeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-code');
      const data = projectSourceRepository[projKey];
      if (!data || !codeModal) return;

      currentProjectCode = data;
      activeFileIndex = 0;

      // Populate Title & Description
      codeModalTitle.textContent = data.title;
      codeModalDesc.textContent = data.desc;
      if (codeGithubLink) {
        codeGithubLink.href = data.github;
      }

      // Generate File Tabs
      codeTabsBar.innerHTML = '';
      data.files.forEach((f, idx) => {
        const tabBtn = document.createElement('button');
        tabBtn.className = `code-tab-btn ${idx === 0 ? 'active' : ''}`;
        tabBtn.setAttribute('role', 'tab');
        tabBtn.innerHTML = `<span>📄</span> <span>${f.name}</span>`;
        tabBtn.addEventListener('click', () => {
          renderCodeFile(idx);
        });
        codeTabsBar.appendChild(tabBtn);
      });

      renderCodeFile(0);
      codeModal.showModal();
    });
  });

  // Copy Code to Clipboard
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', async () => {
      if (!currentProjectCode) return;
      const file = currentProjectCode.files[activeFileIndex];
      if (!file) return;

      try {
        await navigator.clipboard.writeText(file.code);
        copyBtnText.textContent = 'Copied! ✨';
        btnCopyCode.style.color = '#10b981';
        btnCopyCode.style.borderColor = '#10b981';
        setTimeout(() => {
          copyBtnText.textContent = 'Copy Code';
          btnCopyCode.style.color = '';
          btnCopyCode.style.borderColor = '';
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = file.code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtnText.textContent = 'Copied! ✨';
        setTimeout(() => {
          copyBtnText.textContent = 'Copy Code';
        }, 2000);
      }
    });
  }

  // Close Code Modal
  if (codeModalClose && codeModal) {
    codeModalClose.addEventListener('click', () => {
      codeModal.close();
    });

    codeModal.addEventListener('click', (e) => {
      const rect = codeModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        codeModal.close();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. HEADER SCROLL & BACK TO TOP BUTTON
  // --------------------------------------------------------------------------
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    updateActiveNavLink();
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 9. SCROLLSPY (ACTIVE LINK HIGHLIGHTING)
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    if (document.body.classList.contains('spa-focused-mode')) return;
    const scrollPosition = window.scrollY + 130;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const routePath = sectionId === 'hero' ? '#/' : `#/${sectionId}`;
      const navLink = document.querySelector(`.nav-link[href="${routePath}"]`) || document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (navLink) {
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(link => link.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. CONTACT FORM REAL INBOX DELIVERY PIPELINE (FormSubmit.co + Gmail)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');
  const formStatusAlert = document.getElementById('form-status-alert');
  const directEmailBtn = document.getElementById('btn-direct-email');
  const formSubmitSubject = document.getElementById('formsubmit-subject');

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');

  // Dynamic live-updater for direct mail links
  function updateMailtoFallback() {
    const nameVal = (nameInput && nameInput.value.trim()) || 'Visitor';
    const emailVal = (emailInput && emailInput.value.trim()) || '';
    const subjectVal = (subjectInput && subjectInput.value) || 'General Inquiry';
    const messageVal = (messageInput && messageInput.value.trim()) || '';

    const subjectText = `Portfolio Inquiry from ${nameVal} [${subjectVal}]`;
    const bodyText = `Hi Vedashri,\n\n${messageVal}\n\n---\nSender: ${nameVal}\nEmail: ${emailVal}\nSubject: ${subjectVal}`;

    if (formSubmitSubject) {
      formSubmitSubject.value = subjectText;
    }

    const formSubmitNext = document.getElementById('formsubmit-next');
    if (formSubmitNext && window.location.protocol.startsWith('http')) {
      formSubmitNext.value = window.location.href;
    }

    const mailtoUrl = `mailto:vedashrigavali500@gmail.com?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=vedashrigavali500@gmail.com&su=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

    if (directEmailBtn) {
      directEmailBtn.href = gmailWebUrl;
      directEmailBtn.setAttribute('title', 'Directly compose and send in Gmail browser tab');
    }

    return { subjectText, mailtoUrl, gmailWebUrl };
  }

  // Bind live typing updates so fallback URLs are always updated
  [nameInput, emailInput, subjectInput, messageInput].forEach(elem => {
    if (elem) {
      elem.addEventListener('input', updateMailtoFallback);
      elem.addEventListener('change', updateMailtoFallback);
    }
  });

  // --------------------------------------------------------------------------
  // FORM VALIDATION ENGINE (Real-Time Feedback & Accessible Validation)
  // --------------------------------------------------------------------------
  const formValidators = {
    name(val) {
      const trimmed = val ? val.trim() : '';
      if (!trimmed) return 'Please enter your full name.';
      if (trimmed.length < 2) return 'Full name must be at least 2 characters long.';
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name should contain letters, spaces, or hyphens only.';
      return '';
    },
    email(val) {
      const trimmed = val ? val.trim() : '';
      if (!trimmed) return 'Please enter your email address.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g. name@domain.com).';
      return '';
    },
    subject(val) {
      if (!val || val === '') return 'Please choose an inquiry subject.';
      return '';
    },
    message(val) {
      const trimmed = val ? val.trim() : '';
      if (!trimmed) return 'Please write your message.';
      if (trimmed.length < 10) return `Message is too short (${trimmed.length}/10 characters minimum).`;
      return '';
    }
  };

  function validateField(field) {
    if (!field) return true;
    const fieldId = field.id;
    const validator = formValidators[fieldId];
    if (!validator) return true;

    const errorMsg = validator(field.value);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (errorMsg) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.add('active');
      }
      return false;
    } else {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      field.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('active');
      }
      return true;
    }
  }

  function resetFormValidation() {
    [nameInput, emailInput, subjectInput, messageInput].forEach(field => {
      if (!field) return;
      field.classList.remove('is-invalid', 'is-valid', 'shake-field');
      field.removeAttribute('aria-invalid');
      const errorEl = document.getElementById(`${field.id}-error`);
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('active');
      }
    });
  }

  function validateContactForm() {
    const fields = [nameInput, emailInput, subjectInput, messageInput].filter(Boolean);
    let isFormValid = true;
    let firstInvalidField = null;

    fields.forEach(field => {
      const valid = validateField(field);
      if (!valid) {
        isFormValid = false;
        field.classList.add('shake-field');
        setTimeout(() => field.classList.remove('shake-field'), 400);
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return isFormValid;
  }

  // Bind live validation triggers
  [nameInput, emailInput, subjectInput, messageInput].forEach(field => {
    if (!field) return;

    // Validate when user leaves the field
    field.addEventListener('blur', () => {
      if (field.value.trim() !== '' || field.classList.contains('is-invalid')) {
        validateField(field);
      }
    });

    // Re-validate dynamically on input only if already flagged as invalid
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) {
        validateField(field);
      }
    });

    if (field.tagName === 'SELECT') {
      field.addEventListener('change', () => validateField(field));
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Enforce form validation before processing submission
      if (!validateContactForm()) {
        showToast('⚠️ Please fix the highlighted errors before submitting.', 'error');
        return;
      }

      const senderName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Recruiter';
      const senderEmail = emailInput ? emailInput.value.trim() : '';
      const selectedSubject = subjectInput ? subjectInput.value : 'General';
      const textMessage = messageInput ? messageInput.value.trim() : '';

      const { subjectText, mailtoUrl, gmailWebUrl } = updateMailtoFallback();

      // Reset alert status
      if (formStatusAlert) {
        formStatusAlert.style.display = 'none';
        formStatusAlert.className = 'form-status-alert';
        formStatusAlert.innerHTML = '';
      }

      // Set Loading State
      if (contactSubmitBtn) {
        contactSubmitBtn.classList.add('is-loading');
        const btnText = contactSubmitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Delivering to Inbox... 🚀';
      }

      // In local file mode (file:///), automatically open Gmail Web compose tab
      if (window.location.protocol === 'file:') {
        // Automatically open pre-filled Gmail compose window
        const openedTab = window.open(gmailWebUrl, '_blank');

        if (formStatusAlert) {
          formStatusAlert.className = 'form-status-alert alert-success';
          formStatusAlert.innerHTML = `
            <strong>🚀 Gmail Tab Opened with Your Message!</strong><br>
            Your inquiry to <strong>vedashrigavali500@gmail.com</strong> is ready in your browser.<br>
            Just click <strong>"Send"</strong> in the opened Gmail tab to deliver it instantly!
            <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="${gmailWebUrl}" class="btn btn-primary" style="padding: 7px 18px; font-size: 0.85rem;" target="_blank">
                ✉ Click Here if Gmail Tab Didn't Open &rarr;
              </a>
              <a href="${mailtoUrl}" class="btn btn-outline" style="padding: 7px 16px; font-size: 0.85rem;" target="_blank">
                Open in Mail App &nearr;
              </a>
            </div>
            <p style="margin-top: 8px; margin-bottom: 0; font-size: 0.8rem; opacity: 0.85;">
              💡 <em>Note: When hosted online on GitHub Pages, messages deliver in the background automatically without opening tabs.</em>
            </p>
          `;
          formStatusAlert.style.display = 'block';
        }

        showToast(`🚀 Opening Gmail tab... Click 'Send' in Gmail!`);
        triggerCelebrationConfetti(80);
        triggerAchievement('Message Prepared', 'Dispatched via Gmail Web');
        contactForm.reset();
        resetFormValidation();
        updateMailtoFallback();

        if (contactSubmitBtn) {
          contactSubmitBtn.classList.remove('is-loading');
          const btnText = contactSubmitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'Send Message • Deliver to Inbox →';
        }
        return;
      }

      // Background AJAX Dispatch Payload
      const formPayload = {
        name: senderName,
        email: senderEmail,
        _subject: subjectText,
        subject: selectedSubject,
        message: textMessage,
        _template: 'table',
        _captcha: 'false'
      };

      try {
        const response = await fetch('https://formsubmit.co/ajax/vedashrigavali500@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formPayload)
        });

        const data = await response.json().catch(() => ({}));

        if (data && (data.success === true || data.success === 'true' || (data.message && data.message.toLowerCase().includes('success')))) {
          // Success: Delivered to inbox!
          if (formStatusAlert) {
            formStatusAlert.className = 'form-status-alert alert-success';
            formStatusAlert.innerHTML = `
              <strong>✅ Message Successfully Dispatched!</strong><br>
              Your inquiry has been delivered directly to <strong>vedashrigavali500@gmail.com</strong>. Vedashri will get back to you at <strong>${senderEmail || 'your email'}</strong> promptly!
            `;
            formStatusAlert.style.display = 'block';
          }
          showToast(`⚡ Message delivered straight to Vedashri's inbox! Thank you, ${senderName}.`);
          triggerCelebrationConfetti(90);
          triggerAchievement('Message Delivered', 'Dispatched real email to Vedashri');
          contactForm.reset();
          resetFormValidation();
          updateMailtoFallback();
        } else if (data && data.message && data.message.toLowerCase().includes('activation')) {
          // One-time activation required by FormSubmit
          if (formStatusAlert) {
            formStatusAlert.className = 'form-status-alert alert-warning';
            formStatusAlert.innerHTML = `
              <strong>📬 Action Required: One-Time Gmail Activation</strong><br>
              FormSubmit has sent a 1-time verification email to <strong>vedashrigavali500@gmail.com</strong>.<br>
              Open Gmail (including the <strong>Spam folder</strong> or <strong>Updates</strong> tab) and click <strong>"Activate Form"</strong>.<br>
              <em>After this 1-time activation, all future portfolio submissions will land instantly in your inbox!</em>
              <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="https://mail.google.com/mail/u/0/#search/from%3Aformsubmit+activate" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;" target="_blank">
                  🔍 Find & Click "Activate Form" in Gmail &rarr;
                </a>
                <a href="${gmailWebUrl}" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.85rem;" target="_blank">
                  ✉ Send this message now via Gmail &nearr;
                </a>
              </div>
            `;
            formStatusAlert.style.display = 'block';
          }
          showToast(`📬 Activation link sent to vedashrigavali500@gmail.com! Please check Spam/Inbox.`);
          triggerCelebrationConfetti(40);
        } else if (data && data.message && data.message.toLowerCase().includes('web server')) {
          // Web server warning
          if (formStatusAlert) {
            formStatusAlert.className = 'form-status-alert alert-info';
            formStatusAlert.innerHTML = `
              <strong>🖥️ Web Server Required:</strong> Direct background dispatch requires hosting (e.g. GitHub Pages, Vercel, or Live Server).<br>
              <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="${gmailWebUrl}" class="btn btn-primary" style="padding: 7px 16px; font-size: 0.85rem;" target="_blank">
                  ✉ Send via Gmail Web &rarr;
                </a>
                <a href="${mailtoUrl}" class="btn btn-outline" style="padding: 7px 16px; font-size: 0.85rem;" target="_blank">
                  ✉ Open Mail App &nearr;
                </a>
              </div>
            `;
            formStatusAlert.style.display = 'block';
          }
          showToast(`Opening page through a web server or GitHub Pages enables automated inbox delivery.`);
        } else {
          throw new Error((data && data.message) || 'Unknown dispatch response');
        }
      } catch (err) {
        // Network / Adblocker / CORS fallback
        if (formStatusAlert) {
          formStatusAlert.className = 'form-status-alert alert-error';
          formStatusAlert.innerHTML = `
            <strong>⚠️ Notice:</strong> Could not complete background dispatch.<br>
            Please send your message directly via Gmail:
            <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="${gmailWebUrl}" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.88rem;" target="_blank">
                ✉ Send Instantly via Gmail Web &rarr;
              </a>
              <a href="${mailtoUrl}" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.88rem;" target="_blank">
                Open in Mail App &nearr;
              </a>
            </div>
          `;
          formStatusAlert.style.display = 'block';
        }
        showToast(`Notice: Please click the Gmail button above to dispatch directly!`);
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.classList.remove('is-loading');
          const btnText = contactSubmitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'Send Message • Deliver to Inbox →';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10B. COMMAND PALETTE & DEVELOPER TERMINAL (CTRL+K / CMD+K)
  // --------------------------------------------------------------------------
  const cmdPaletteModal = document.getElementById('cmd-palette-modal');
  const btnCmdPalette = document.getElementById('btn-cmd-palette');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdResultsList = document.getElementById('cmd-results-list');

  const paletteCommands = [
    {
      id: 'cmd-resume',
      title: 'View 1-Page Official Resume',
      desc: 'Opens the verified compact 1-page ATS resume CV',
      icon: '📄',
      shortcut: 'CV',
      action: () => window.open('resume.html', '_blank')
    },
    {
      id: 'cmd-download',
      title: 'Download 1-Page PDF Resume',
      desc: 'Direct download Vedashri_Gavali_Resume.pdf',
      icon: '📥',
      shortcut: 'PDF',
      action: () => {
        const a = document.createElement('a');
        a.href = 'Vedashri_Gavali_Resume.pdf';
        a.download = 'Vedashri_Gavali_Resume.pdf';
        a.click();
      }
    },
    {
      id: 'cmd-cheat',
      title: 'Recruiter 30-Second Cheat Sheet',
      desc: 'Instant summary of CGPA, skills, notice period, and direct contact',
      icon: '⚡',
      shortcut: 'HIRE',
      action: () => openCheatSheetModal()
    },
    {
      id: 'cmd-role-matcher',
      title: '🎯 Recruiter Role Matcher',
      desc: 'Tailor skills, projects & resume to your open position',
      icon: '🎯',
      shortcut: 'ROLE',
      action: () => scrollToSection('role-matcher')
    },
    {
      id: 'cmd-confetti',
      title: '🎉 Celebration Confetti Burst',
      desc: 'Fire a vibrant celebration particle explosion',
      icon: '🎉',
      shortcut: 'PARTY',
      action: () => triggerCelebrationConfetti(90)
    },
    {
      id: 'cmd-matrix',
      title: '🕶️ Matrix Cyberpunk Rain Mode',
      desc: 'Secret Easter Egg: Enter the green digital terminal',
      icon: '🟢',
      shortcut: 'NEO',
      action: () => toggleMatrixMode()
    },
    {
      id: 'cmd-projects',
      title: 'Browse Projects Showcase',
      desc: 'Scroll directly to Academic & Professional Projects',
      icon: '🚀',
      shortcut: 'PROJ',
      action: () => scrollToSection('projects')
    },
    {
      id: 'cmd-course-code',
      title: 'Student Course Management Source Code',
      desc: 'Inspect Core Java Spring Boot controller, service & schema',
      icon: '☕',
      shortcut: 'JAVA',
      action: () => openProjectCode('course-mgmt')
    },
    {
      id: 'cmd-skills',
      title: 'Technical Competencies & Proficiency',
      desc: 'Explore Core Java, Spring Boot, React, SQL & animated meters',
      icon: '🛠️',
      shortcut: 'STACK',
      action: () => scrollToSection('skills')
    },
    {
      id: 'cmd-theme',
      title: 'Toggle Color Theme (Dark / Light)',
      desc: 'Switch between Emerald Prestige and Luxe Light modes',
      icon: '🎨',
      shortcut: 'THEME',
      action: () => {
        if (themeToggle) themeToggle.click();
      }
    },
    {
      id: 'cmd-contact',
      title: 'Contact Vedashri via Webhook',
      desc: 'Scroll down to the real-time webhook contact form',
      icon: '✉️',
      shortcut: 'MSG',
      action: () => scrollToSection('contact')
    },
    {
      id: 'cmd-github',
      title: 'Open GitHub Profile',
      desc: 'Visit https://github.com/vedashri-gavali',
      icon: '🐙',
      shortcut: 'GIT',
      action: () => window.open('https://github.com/vedashri-gavali', '_blank')
    },
    {
      id: 'cmd-linkedin',
      title: 'Open LinkedIn Profile',
      desc: 'Connect with Vedashri on LinkedIn',
      icon: '🔗',
      shortcut: 'LINK',
      action: () => window.open('https://linkedin.com/in/vedashri-gavali', '_blank')
    }
  ];

  let selectedCmdIndex = 0;
  let filteredCommands = [...paletteCommands];

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function openProjectCode(codeKey) {
    const btn = document.querySelector(`.project-btn-code[data-code="${codeKey}"]`);
    if (btn) btn.click();
  }

  function renderPaletteItems() {
    if (!cmdResultsList) return;
    cmdResultsList.innerHTML = '';

    if (filteredCommands.length === 0) {
      cmdResultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #64748b; font-size: 0.88rem;">
          No matching commands found. Try 'projects', 'resume', 'hooks', or 'theme'.
        </div>
      `;
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `cmd-item ${idx === selectedCmdIndex ? 'selected' : ''}`;
      item.setAttribute('role', 'option');
      item.innerHTML = `
        <div class="cmd-item-left">
          <span class="cmd-item-icon">${cmd.icon}</span>
          <div class="cmd-item-info">
            <span class="cmd-item-title">${cmd.title}</span>
            <span class="cmd-item-desc">${cmd.desc}</span>
          </div>
        </div>
        <span class="cmd-item-key">${cmd.shortcut}</span>
      `;

      item.addEventListener('click', () => {
        cmdPaletteModal.close();
        cmd.action();
      });

      cmdResultsList.appendChild(item);
    });
  }

  function openCommandPalette() {
    if (!cmdPaletteModal) return;
    filteredCommands = [...paletteCommands];
    selectedCmdIndex = 0;
    if (cmdSearchInput) cmdSearchInput.value = '';
    renderPaletteItems();
    cmdPaletteModal.showModal();
    if (cmdSearchInput) {
      setTimeout(() => cmdSearchInput.focus(), 50);
    }
  }

  // Global Keyboard Listener for Ctrl+K and Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdPaletteModal && cmdPaletteModal.open) {
        cmdPaletteModal.close();
      } else {
        openCommandPalette();
      }
    }
  });

  if (btnCmdPalette) {
    btnCmdPalette.addEventListener('click', openCommandPalette);
  }

  // Filter Search
  if (cmdSearchInput) {
    cmdSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filteredCommands = paletteCommands.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.desc.toLowerCase().includes(query) ||
        c.shortcut.toLowerCase().includes(query)
      );
      selectedCmdIndex = 0;
      renderPaletteItems();
    });

    // Arrow Key Navigation
    cmdSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          selectedCmdIndex = (selectedCmdIndex + 1) % filteredCommands.length;
          renderPaletteItems();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          selectedCmdIndex = (selectedCmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
          renderPaletteItems();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedCmdIndex]) {
          cmdPaletteModal.close();
          filteredCommands[selectedCmdIndex].action();
        }
      } else if (e.key === 'Escape') {
        cmdPaletteModal.close();
      }
    });
  }

  if (cmdPaletteModal) {
    cmdPaletteModal.addEventListener('click', (e) => {
      const rect = cmdPaletteModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        cmdPaletteModal.close();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10C. RECRUITER 30-SECOND CHEAT SHEET MODAL
  // --------------------------------------------------------------------------
  const cheatSheetModal = document.getElementById('cheat-sheet-modal');
  const navCheatBtn = document.getElementById('nav-cheat-btn');
  const heroCheatBtn = document.getElementById('hero-cheat-sheet-btn');
  const cheatModalClose = document.getElementById('cheat-modal-close');

  function openCheatSheetModal() {
    if (cheatSheetModal) {
      cheatSheetModal.showModal();
    }
  }

  if (navCheatBtn) navCheatBtn.addEventListener('click', openCheatSheetModal);
  if (heroCheatBtn) heroCheatBtn.addEventListener('click', openCheatSheetModal);

  if (cheatModalClose && cheatSheetModal) {
    cheatModalClose.addEventListener('click', () => cheatSheetModal.close());
    cheatSheetModal.addEventListener('click', (e) => {
      const rect = cheatSheetModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        cheatSheetModal.close();
      }
    });
  }

  let toastTimeout;
  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add('active');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 4500);
  }

  // --------------------------------------------------------------------------
  // 11. CURSOR SPOTLIGHT AURA FOLLOWER
  // --------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;
      cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // --------------------------------------------------------------------------
  // 12. 3D PERSPECTIVE GLASS TILT ON CARDS
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.tilt-card');
  if (window.matchMedia('(pointer: fine)').matches) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((cardY - centerY) / centerY) * -6;
        const rotateY = ((cardX - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 13. HERO QUICK-STATS COUNTER ANIMATION
  // --------------------------------------------------------------------------
  const statBoxes = document.querySelectorAll('.stat-box[data-count]');
  if (statBoxes.length > 0) {
    statBoxes.forEach(box => {
      const target = parseFloat(box.getAttribute('data-count'));
      const isDecimal = parseInt(box.getAttribute('data-decimal'), 10) || 0;
      const suffix = box.getAttribute('data-suffix') || '';
      const numberEl = box.querySelector('.stat-number');

      if (numberEl && !isNaN(target)) {
        let current = 0;
        const steps = 40;
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          numberEl.textContent = (isDecimal > 0 ? current.toFixed(isDecimal) : Math.round(current)) + suffix;
        }, 35);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 14. SCROLL REVEAL ANIMATIONS
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.section, .experience-card, .cert-card');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  // --------------------------------------------------------------------------
  // 15. INTERACTIVE FULL-PAGE MAGNETIC PARTICLE CONSTELLATION
  // Continuous full-window floating dot constellation across all sections
  // --------------------------------------------------------------------------
  const heroCanvas = document.getElementById('hero-canvas');

  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrameId = null;
    let isVisible = true;
    let mouse = { x: -9999, y: -9999, radius: 160 };

    function resizeCanvas() {
      width = heroCanvas.width = window.innerWidth;
      height = heroCanvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 16000), 55);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.65,
          vy: (Math.random() - 0.5) * 0.65,
          radius: Math.random() * 2 + 1.2,
          baseColor: Math.random() > 0.5 ? '16, 185, 129' : '56, 189, 248'
        });
      }
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    function renderHeroCanvas() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += dx * force * 0.03;
          p.y += dy * force * 0.03;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.baseColor}, 0.65)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distBetween < 115) {
            const alpha = (1 - distBetween / 115) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${p.baseColor}, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderHeroCanvas);
    }

    // Keep running during page scroll and pause only if page is hidden
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(renderHeroCanvas);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();
    renderHeroCanvas();
  }

  // --------------------------------------------------------------------------
  // 16. FULL-SCREEN CELEBRATION CONFETTI ENGINE
  // --------------------------------------------------------------------------
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiPieces = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti, { passive: true });
  resizeConfetti();

  function triggerCelebrationConfetti(count = 70, originX = window.innerWidth / 2, originY = window.innerHeight * 0.45) {
    if (!confettiCanvas || !confettiCtx) return;

    const colors = ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#34d399', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 9 + 4;
      confettiPieces.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    if (!confettiAnimId) {
      runConfettiLoop();
    }
  }

  function runConfettiLoop() {
    if (!confettiCtx || confettiPieces.length === 0) {
      if (confettiCtx) confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
      return;
    }

    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiPieces.length - 1; i >= 0; i--) {
      const p = confettiPieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > confettiCanvas.height + 50) {
        confettiPieces.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }

    confettiAnimId = requestAnimationFrame(runConfettiLoop);
  }

  // --------------------------------------------------------------------------
  // 17. GAMIFIED ACHIEVEMENT TOAST NOTIFIER
  // --------------------------------------------------------------------------
  const unlockedAchievements = new Set();
  function triggerAchievement(title, desc) {
    if (unlockedAchievements.has(title)) return;
    unlockedAchievements.add(title);

    showToast(`🏆 ${title} — ${desc}`);
    triggerCelebrationConfetti(35, window.innerWidth * 0.85, window.innerHeight * 0.85);
  }

  // --------------------------------------------------------------------------
  // 18. RECRUITER ROLE MATCHER (INTERACTIVE ATTENTION HOOK)
  // --------------------------------------------------------------------------
  const rolePills = document.querySelectorAll('.role-pill-btn');
  const matcherResultBox = document.getElementById('matcher-result-box');
  const matcherScoreBadge = document.getElementById('matcher-score-badge');
  const matcherRoleTitle = document.getElementById('matcher-role-title');
  const matcherSummary = document.getElementById('matcher-summary');
  const matcherResetBtn = document.getElementById('matcher-reset-btn');

  const roleDefinitions = {
    java: {
      title: 'Java & Spring Boot Backend Specialist',
      score: '98% Role Match 🔥',
      summary: 'Demonstrated proficiency in Core Java, OOP architectures, Spring Boot REST controllers, Spring Data JPA persistence, and MySQL transaction management. 4 real-world internships and 8.35 CGPA.',
      highlightKeywords: ['Java', 'Spring', 'RESTful', 'MySQL', 'OOP', 'Git'],
      filterCategory: 'java'
    },
    fullstack: {
      title: 'Full-Stack Software Engineer',
      score: '99% Role Match 🔥',
      summary: 'Seamless bridge between frontend user experience (HTML5, CSS3, JavaScript, React.js) and robust backend microservices (Java Spring Boot & Python REST APIs). End-to-end full-stack capabilities.',
      highlightKeywords: ['Java', 'Spring', 'React', 'JavaScript', 'HTML5', 'CSS3', 'RESTful', 'MySQL'],
      filterCategory: 'all'
    },
    python: {
      title: 'Python & Backend Data Developer',
      score: '96% Role Match 🔥',
      summary: 'Strong foundations in Python scripting, database schema design, and data-driven full-stack web platforms. Proven implementation in Krishi Connect and Alumni Management.',
      highlightKeywords: ['Python', 'MySQL', 'Database', 'HTML5', 'CSS3', 'JavaScript'],
      filterCategory: 'python'
    },
    iot: {
      title: 'Electronics, VLSI & Embedded IoT Engineer',
      score: '95% Role Match 🔥',
      summary: 'Multidisciplinary engineering background blending B.Tech in Electronics & VLSI with hands-on software development, IoT telemetry (Blynk), and embedded systems prototyping.',
      highlightKeywords: ['VLSI', 'IoT', 'Embedded', 'Java', 'Problem-Solving'],
      filterCategory: 'web'
    }
  };

  function applyRoleMatch(roleKey, triggerScroll = false) {
    const config = roleDefinitions[roleKey];
    if (!config) return;

    rolePills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-role') === roleKey);
    });

    if (matcherScoreBadge) matcherScoreBadge.textContent = config.score;
    if (matcherRoleTitle) matcherRoleTitle.textContent = config.title;
    if (matcherSummary) matcherSummary.textContent = config.summary;
    if (matcherResultBox) matcherResultBox.style.display = 'flex';

    const skillListItems = document.querySelectorAll('.skill-tags li');
    skillListItems.forEach(li => {
      const text = li.textContent.toLowerCase();
      const isMatched = config.highlightKeywords.some(kw => text.includes(kw.toLowerCase()));
      li.classList.toggle('is-role-matched', isMatched);
    });

    const targetFilterBtn = document.querySelector(`.filter-btn[data-filter="${config.filterCategory}"]`);
    if (targetFilterBtn) {
      targetFilterBtn.click();
    }

    triggerCelebrationConfetti(50);
    triggerAchievement('Dream Candidate', `Tailored to ${config.title}`);

    if (triggerScroll && matcherResultBox) {
      matcherResultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function resetRoleMatch() {
    rolePills.forEach(p => p.classList.remove('active'));
    if (matcherResultBox) matcherResultBox.style.display = 'none';

    const skillListItems = document.querySelectorAll('.skill-tags li');
    skillListItems.forEach(li => li.classList.remove('is-role-matched'));

    const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilterBtn) allFilterBtn.click();
  }

  rolePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const roleKey = pill.getAttribute('data-role');
      applyRoleMatch(roleKey, false);
    });
  });

  if (matcherResetBtn) {
    matcherResetBtn.addEventListener('click', resetRoleMatch);
  }

  // Easter Egg: Matrix Rain Mode Toggle
  function toggleMatrixMode() {
    const isMatrix = document.body.classList.toggle('matrix-mode');
    if (isMatrix) {
      showToast('🟢 Matrix Mode Activated! Welcome to Zion.');
      triggerCelebrationConfetti(60);
    } else {
      showToast('Standard View Restored.');
    }
  }

  // Hook Achievement to Theme Switcher
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      triggerAchievement('Night Owl', 'Toggled Color Theme');
    });
  }

  // Hook Celebration Confetti to Hire Me & Resume buttons
  const hireButtons = document.querySelectorAll('.nav-hire-btn, .cheat-action-btn[href*="mailto"]');
  hireButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      triggerCelebrationConfetti(60);
    });
  });

  // --------------------------------------------------------------------------
  // 19. VEDASHRI AI CAREER ASSISTANT CHATBOT ENGINE
  // --------------------------------------------------------------------------
  (() => {
    const launcher = document.getElementById('ai-chat-launcher');
    const drawer = document.getElementById('ai-chat-drawer');
    const closeBtn = document.getElementById('ai-close-drawer-btn');
    const clearBtn = document.getElementById('ai-clear-chat-btn');
    const voiceToggleBtn = document.getElementById('ai-voice-toggle-btn');
    const voiceIcon = document.getElementById('ai-voice-icon');
    const promptBubble = document.getElementById('ai-chat-prompt-bubble');
    const bubbleCloseBtn = document.getElementById('ai-bubble-close-btn');
    const messagesList = document.getElementById('ai-messages-list');
    const typingStatus = document.getElementById('ai-typing-status');
    const chatForm = document.getElementById('ai-input-form');
    const chatInput = document.getElementById('ai-text-input');
    const chips = document.querySelectorAll('.ai-chip');

    if (!launcher || !drawer || !messagesList) return;

    let voiceEnabled = false;
    let chatOpened = false;

    // Show prompt bubble after 4.5s if not opened yet
    setTimeout(() => {
      if (!chatOpened && promptBubble) {
        promptBubble.classList.add('visible');
      }
    }, 4500);

    if (bubbleCloseBtn) {
      bubbleCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (promptBubble) promptBubble.classList.remove('visible');
      });
    }

    if (promptBubble) {
      promptBubble.addEventListener('click', () => {
        promptBubble.classList.remove('visible');
        openChat();
      });
    }

    function openChat() {
      chatOpened = true;
      if (promptBubble) promptBubble.classList.remove('visible');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      if (chatInput) chatInput.focus();
    }

    function closeChat() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
    }

    launcher.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeChat();
      } else {
        openChat();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeChat();
      }
    });

    // Voice toggle
    if (voiceToggleBtn && voiceIcon) {
      voiceToggleBtn.addEventListener('click', () => {
        voiceEnabled = !voiceEnabled;
        voiceIcon.textContent = voiceEnabled ? '🔊' : '🔇';
        voiceToggleBtn.title = voiceEnabled ? 'Voice enabled (click to mute)' : 'Voice muted (click to enable)';
        if (!voiceEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    function speakText(text) {
      if (!voiceEnabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      // Strip HTML tags for clean speech
      const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.05;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    }

    function getTimeString() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMessage(htmlContent, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-msg ${isUser ? 'ai-msg-user' : 'ai-msg-bot'}`;

      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = 'ai-msg-bubble';
      bubbleDiv.innerHTML = htmlContent;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'ai-msg-time';
      timeSpan.textContent = getTimeString();

      msgDiv.appendChild(bubbleDiv);
      msgDiv.appendChild(timeSpan);
      messagesList.appendChild(msgDiv);

      // Auto scroll
      messagesList.scrollTop = messagesList.scrollHeight;

      if (!isUser) {
        speakText(htmlContent);
      }
    }

    // Initial greeting
    function initWelcome() {
      messagesList.innerHTML = '';
      const welcome = `
        <p>👋 <strong>Hello! I'm Vedashri's AI Assistant.</strong></p>
        <p>I'm trained on Vedashri's credentials, technical stack, internships, and project architectures. You can ask me anything, or tap a quick chip above!</p>
        <div class="ai-actions-row">
          <a href="#projects" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">🚀 View Projects</a>
          <a href="resume.html" target="_blank" class="ai-action-link">📄 Open Resume CV</a>
          <a href="#contact" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">✉️ Contact Vedashri</a>
        </div>
      `;
      addMessage(welcome, false);
    }

    initWelcome();

    if (clearBtn) {
      clearBtn.addEventListener('click', initWelcome);
    }

    // Knowledge base reasoning engine
    function getAssistantResponse(prompt) {
      const p = prompt.toLowerCase();

      // 1. Java & Spring Boot
      if (p.includes('java') || p.includes('spring') || p.includes('backend') || p.includes('jpa') || p.includes('hibernate')) {
        return `
          <p>☕ <strong>Java &amp; Spring Boot Expertise:</strong></p>
          <p>Vedashri is deeply proficient in <strong>Core Java</strong>, <strong>Object-Oriented Programming (OOPs)</strong>, Collections, Multi-threading, and Exception Handling.</p>
          <ul>
            <li><strong>Spring Boot &amp; REST APIs:</strong> Built layered architectures with controllers, services, repositories, and DTOs.</li>
            <li><strong>Database Integration:</strong> Hands-on with <code>Spring Data JPA</code>, <code>Hibernate</code>, and <code>MySQL</code> for robust CRUD persistence.</li>
            <li><strong>Internship Experience:</strong> Completed a dedicated Java Developer internship at Profound Edutech and built the College Alumni Portal.</li>
          </ul>
          <div class="ai-actions-row">
            <a href="#projects" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">View Java Projects &rarr;</a>
            <a href="resume.html" target="_blank" class="ai-action-link">Inspect Resume &rarr;</a>
          </div>
        `;
      }

      // 2. Education, College, CGPA
      if (p.includes('cgpa') || p.includes('education') || p.includes('college') || p.includes('academics') || p.includes('marks') || p.includes('grade') || p.includes('b.tech') || p.includes('diploma')) {
        return `
          <p>🎓 <strong>Academic Credentials &amp; Performance:</strong></p>
          <ul>
            <li><strong>B.Tech in Electronics (VLSI Design &amp; Technology):</strong> MIT Chhatrapati Sambhajinagar (2024&ndash;2027) &bull; <strong>CGPA: 8.35 / 10</strong>.</li>
            <li><strong>Diploma in Computer Technology:</strong> Government Polytechnic (2021&ndash;2024) &bull; <strong>84.40% First Class with Distinction</strong>.</li>
            <li><strong>Secondary School (10th SSC):</strong> <strong>83.80%</strong>.</li>
          </ul>
          <p>Her blend of Computer Science diploma + Electronics degree gives her a unique edge in both software systems and embedded hardware!</p>
          <div class="ai-actions-row">
            <a href="#education" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">View Education Timeline &rarr;</a>
          </div>
        `;
      }

      // 3. Projects
      if (p.includes('project') || p.includes('alumni') || p.includes('iot') || p.includes('automation') || p.includes('portfolio') || p.includes('system')) {
        return `
          <p>🚀 <strong>Featured Core Projects:</strong></p>
          <ul>
            <li><strong>College Alumni Portal:</strong> Web-based platform built with <code>Java, Spring Boot, React, MySQL</code>. Features alumni verification, career networking, and event scheduling.</li>
            <li><strong>Smart Home Automation (IoT):</strong> Hardware-software digital twin using <code>ESP32, C++, Blynk Cloud IoT</code>. Enables smartphone relay control and telemetry monitoring.</li>
            <li><strong>Portfolio Architecture &amp; Code Inspector:</strong> Interactive engineering showcase with live AST source code inspector, command palette (Ctrl+K), and responsive themes.</li>
          </ul>
          <div class="ai-actions-row">
            <a href="#projects" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">Explore Projects with Live Code &rarr;</a>
          </div>
        `;
      }

      // 4. Internships & Experience
      if (p.includes('intern') || p.includes('experience') || p.includes('work') || p.includes('company') || p.includes('codex') || p.includes('profound')) {
        return `
          <p>💼 <strong>4 Real-World Internships Completed:</strong></p>
          <ul>
            <li><strong>MERN Full Stack Intern:</strong> Codex Technologies (2025) &ndash; Developed responsive UI modules and API endpoints.</li>
            <li><strong>Web Development Intern:</strong> Main Flow Services and Technologies (2024) &ndash; Built semantic layouts, animations, and cross-browser compatibility.</li>
            <li><strong>Java Developer Intern:</strong> Profound Edutech (2023) &ndash; Core Java backend programs, OOP architecture, and database connectivity.</li>
            <li><strong>Python Developer Intern:</strong> Ypsilon IT Solutions (2023) &ndash; Scripting, database operations, and data automation.</li>
          </ul>
          <div class="ai-actions-row">
            <a href="#experience" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">View Experience Details &rarr;</a>
          </div>
        `;
      }

      // 5. Relocation, Notice period, Availability, Location
      if (p.includes('relocate') || p.includes('notice') || p.includes('location') || p.includes('remote') || p.includes('available') || p.includes('hybrid') || p.includes('joining')) {
        return `
          <p>📍 <strong>Availability &amp; Mobility:</strong></p>
          <ul>
            <li><strong>Availability:</strong> Immediate / Open for Full-Time Roles and Internships.</li>
            <li><strong>Location:</strong> Currently based in Chhatrapati Sambhajinagar, Maharashtra, India.</li>
            <li><strong>Mobility:</strong> 100% open to relocate anywhere (Bangalore, Pune, Mumbai, Hyderabad, Delhi NCR, etc.).</li>
            <li><strong>Work Models:</strong> Open for On-site, Hybrid, or Remote setups.</li>
          </ul>
          <div class="ai-actions-row">
            <a href="#contact" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">Schedule an Interview &rarr;</a>
          </div>
        `;
      }

      // 6. Why hire her
      if (p.includes('why') || p.includes('hire') || p.includes('strength') || p.includes('fit') || p.includes('candidate') || p.includes('value')) {
        return `
          <p>⭐ <strong>Top Reasons to Hire Vedashri:</strong></p>
          <ul>
            <li><strong>Dual Rigor:</strong> Strong foundation in CS principles (Diploma in Computer Tech) combined with engineering discipline (B.Tech VLSI).</li>
            <li><strong>Battle-Tested Fundamentals:</strong> 4 industry internships, an 8.35 CGPA, and hands-on Spring Boot + React projects.</li>
            <li><strong>Full-Stack &amp; Hardware Acumen:</strong> Able to design clean user interfaces, architect RESTful microservices, and interface with IoT devices.</li>
            <li><strong>Fast Learner &amp; Immediate Value:</strong> Adaptable, disciplined, and passionate about writing clean, maintainable code.</li>
          </ul>
          <div class="ai-actions-row">
            <a href="resume.html" target="_blank" class="ai-action-link">View Recruiter CV &rarr;</a>
            <a href="mailto:vedashrigavali500@gmail.com" class="ai-action-link">Hire Directly &rarr;</a>
          </div>
        `;
      }

      // 7. Contact, Email, Phone, Socials
      if (p.includes('contact') || p.includes('email') || p.includes('phone') || p.includes('call') || p.includes('reach') || p.includes('linkedin') || p.includes('github') || p.includes('mobile')) {
        return `
          <p>✉️ <strong>Direct Contact Coordinates:</strong></p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:vedashrigavali500@gmail.com" style="color: var(--primary-light);">vedashrigavali500@gmail.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+918010132230" style="color: var(--primary-light);">+91 80101 32230</a></li>
            <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/vedashri-gavali" target="_blank" rel="noopener noreferrer" style="color: #38bdf8;">linkedin.com/in/vedashri-gavali</a></li>
            <li><strong>Location:</strong> Chhatrapati Sambhajinagar, Maharashtra, India</li>
          </ul>
          <div class="ai-actions-row">
            <a href="mailto:vedashrigavali500@gmail.com" class="ai-action-link">Send Email Now &rarr;</a>
            <a href="tel:+918010132230" class="ai-action-link">Call Directly &rarr;</a>
          </div>
        `;
      }

      // 8. Resume / CV
      if (p.includes('resume') || p.includes('cv') || p.includes('download') || p.includes('pdf')) {
        return `
          <p>📄 <strong>Vedashri's Resume &amp; CV:</strong></p>
          <p>You can view her full interactive ATS-optimized resume directly in the browser or download the 1-page PDF version:</p>
          <div class="ai-actions-row">
            <a href="resume.html" target="_blank" class="ai-action-link">📄 Open Web Resume</a>
            <a href="Vedashri_Gavali_Resume.pdf" download="Vedashri_Gavali_Resume.pdf" class="ai-action-link">📥 Download 1-Page PDF</a>
          </div>
        `;
      }

      // 9. Skills / Tech stack
      if (p.includes('skill') || p.includes('stack') || p.includes('tech') || p.includes('languages') || p.includes('react') || p.includes('python') || p.includes('sql') || p.includes('frontend')) {
        return `
          <p>💻 <strong>Technical Stack Overview:</strong></p>
          <ul>
            <li><strong>Languages:</strong> Core Java (OOPs, Collections, Streams), Python, JavaScript (ES6+), C++, HTML5, CSS3, SQL.</li>
            <li><strong>Frameworks &amp; Libraries:</strong> Spring Boot, Spring Data JPA, Hibernate, React.js, Express.js.</li>
            <li><strong>Databases &amp; Tools:</strong> MySQL, Git &amp; GitHub, VS Code, IntelliJ IDEA, Power BI, Blynk IoT.</li>
          </ul>
          <div class="ai-actions-row">
            <a href="#skills" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">See Interactive Skill Meters &rarr;</a>
          </div>
        `;
      }

      // 10. Certifications
      if (p.includes('certif') || p.includes('course') || p.includes('badge')) {
        return `
          <p>🏆 <strong>Key Certifications (9+ Total):</strong></p>
          <ul>
            <li>Java Full Stack Engineering</li>
            <li>Python Programming &amp; Database Applications</li>
            <li>Web Development &amp; Responsive UI Architectures</li>
            <li>IoT Systems &amp; Sensor Interfacing</li>
          </ul>
          <div class="ai-actions-row">
            <a href="#certifications" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">View All Certifications &rarr;</a>
          </div>
        `;
      }

      // 11. Chit-chat & Greetings
      if (p.includes('hi') || p.includes('hello') || p.includes('hey') || p.includes('namaste') || p.includes('how are you')) {
        let visitorGreet = '';
        try {
          const profile = JSON.parse(localStorage.getItem('vg_visitor_welcome_profile') || 'null');
          if (profile && profile.name && profile.name !== 'Guest Explorer') {
            visitorGreet = ` ${profile.name}`;
          }
        } catch (e) {}
        return `
          <p>Hello${visitorGreet}! 😊 Great to connect with you. How can I help you evaluate Vedashri for your team today? Feel free to ask about her <strong>Java skills, projects, CGPA, or notice period</strong>!</p>
        `;
      }

      // Default fallback
      return `
        <p>Thanks for asking! I'm trained specifically on Vedashri's credentials, engineering skills, and portfolio.</p>
        <p>Would you like to know about:</p>
        <ul>
          <li>Her <strong>Core Java &amp; Spring Boot</strong> experience?</li>
          <li>Her <strong>4 industry internships</strong> or <strong>8.35 CGPA</strong>?</li>
          <li>Her <strong>Alumni Portal</strong> or <strong>IoT Smart Home</strong> projects?</li>
        </ul>
        <div class="ai-actions-row">
          <a href="resume.html" target="_blank" class="ai-action-link">📄 Open Resume CV</a>
          <a href="#contact" class="ai-action-link" onclick="document.getElementById('ai-close-drawer-btn').click();">✉️ Contact Vedashri</a>
        </div>
      `;
    }

    function handleUserSubmit(userText) {
      if (!userText || !userText.trim()) return;
      const cleanText = userText.trim();

      // Add user message
      addMessage(cleanText, true);
      chatInput.value = '';

      // Show typing status
      if (typingStatus) typingStatus.style.display = 'flex';
      messagesList.scrollTop = messagesList.scrollHeight;

      // Realistic delay (350 - 550ms)
      setTimeout(() => {
        if (typingStatus) typingStatus.style.display = 'none';
        const responseHtml = getAssistantResponse(cleanText);
        addMessage(responseHtml, false);
      }, 450);
    }

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserSubmit(chatInput.value);
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt') || chip.textContent;
        handleUserSubmit(prompt);
      });
    });
  })();
});

