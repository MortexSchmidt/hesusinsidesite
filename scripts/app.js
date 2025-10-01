// Маленькие «iOS-like» анимация и фишки интерфейса

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Переключатель тем Twitch/Kick в виде дропдауна
(function themeDropdown() {
  const switcher = $('.theme-switcher');
  if (!switcher) return;

  const toggleBtn = $('#theme-toggle-btn', switcher);
  const dropdown = $('#theme-dropdown', switcher);
  const themeOptions = $$('.theme-option', switcher);

  // 1. Установить тему при загрузке
  let currentTheme = localStorage.getItem('theme') || 'twitch';
  applyTheme(currentTheme);

  // 2. Показать/скрыть дропдаун
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('is-open');
  });

  // 3. Закрыть дропдаун при клике вне его
  document.addEventListener('click', () => {
    dropdown.classList.remove('is-open');
  });

  // 4. Установить тему при выборе опции
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const newTheme = option.dataset.theme;
      if (newTheme) {
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      }
    });
  });

  function applyTheme(theme) {
    if (theme === 'twitch') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }
})();

// Сглаживание якорных переходов
(function smoothAnchors(){
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){
      e.preventDefault();
      // Добавляем смещение для хедера
      const headerOffset = 70;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
      });
    }
  });
})();

// Анимации при прокрутке
(function scrollAnimations() {
  const animatedElements = $$('.section, .hero > *, .widgets > *, .news-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // observer.unobserve(entry.target); // Можно раскомментировать, если анимация нужна только один раз
      } else {
        // entry.target.classList.remove('in-view'); // Можно раскомментировать для повторной анимации
      }
    });
  }, {
    threshold: 0.1,
  });

  animatedElements.forEach(el => {
    observer.observe(el);
  });
})();

// Twitch Chat Toggle
const chatContainer = document.getElementById('twitch-chat-container');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatPanel = document.getElementById('chat-panel');
const body = document.body;

const menuToggleBtn = document.getElementById('menu-toggle-btn');
const navRight = document.querySelector('.nav-right');
const mainNav = document.querySelector('.nav');

if (chatContainer && chatToggleBtn && chatCloseBtn) {
  chatToggleBtn.addEventListener('click', () => {
    chatContainer.classList.add('is-visible');
  });

  chatCloseBtn.addEventListener('click', () => {
    chatContainer.classList.remove('is-visible');
  });

  chatToggleBtn.addEventListener('click', () => {
    chatPanel.classList.toggle('is-open');
    body.classList.toggle('chat-open');
  });
}

// Логика для мобильного меню
if (menuToggleBtn && navRight && mainNav) {
  menuToggleBtn.addEventListener('click', () => {
    navRight.classList.toggle('is-open');
    mainNav.classList.toggle('is-open'); // Для анимации иконки бургера
  });
}

// Плавный скролл для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      // Добавляем смещение для хедера
      const headerOffset = 70;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
      });
    }
  });
});
