/**
 * hero-slider.js — KAMC Hero Section
 * ─────────────────────────────────────────────────────
 * Fonctionnalités :
 *  - Carousel directionnel (gauche / droite)
 *  - Autoplay avec pause au hover
 *  - Navigation par dots
 *  - Progress bar mobile (indicateur d'autoplay)
 *  - Swipe tactile (mobile)
 *  - Navigation clavier (← →)
 *  - Menu mobile slider latéral (slide-in depuis la droite)
 *  - Fermeture du menu : bouton ×, overlay, touche Escape, liens
 *  - Gestion de l'accessibilité (aria-*, focus trap, body scroll lock)
 * ─────────────────────────────────────────────────────
 */

document.addEventListener("DOMContentLoaded", () => {

    /* ═══════════════════════════════════════════════
       1. SÉLECTION DES ÉLÉMENTS
    ═══════════════════════════════════════════════ */

    // Slider
    const slides        = document.querySelectorAll(".hero-slide");
    const dots          = document.querySelectorAll(".dot");
    const sliderTrack   = document.querySelector(".hero-slides");

    // Progress bar (mobile)
    const progressBar   = document.querySelector(".hero-progress__bar");

    // Menu mobile
    const burger        = document.querySelector(".burger");
    const mobileMenu    = document.getElementById("mobile-menu");
    const menuClose     = document.querySelector(".mobile-menu__close");
    const overlay       = document.querySelector(".mobile-overlay");


    /* ═══════════════════════════════════════════════
       2. ÉTAT DU SLIDER
    ═══════════════════════════════════════════════ */

    let currentIndex      = 0;
    let autoPlayTimer     = null;
    const SLIDE_DELAY     = 7000; // ms

    let isDragging        = false;
    let touchStartX       = 0;
    let touchEndX         = 0;
    const SWIPE_THRESHOLD = 45; // px


    /* ═══════════════════════════════════════════════
       3. PROGRESS BAR MOBILE
    ═══════════════════════════════════════════════ */

    /**
     * Démarre l'animation de la barre de progression.
     * On synchronise sa durée avec SLIDE_DELAY via une custom property CSS.
     */
    function startProgress() {
        if (!progressBar) return;

        // Réinitialise proprement
        progressBar.classList.remove("animating");
        progressBar.style.setProperty("--slide-delay", `${SLIDE_DELAY}ms`);

        // Forcer un reflow pour redémarrer l'animation
        void progressBar.offsetWidth;

        progressBar.classList.add("animating");
    }

    function stopProgress() {
        if (!progressBar) return;
        progressBar.classList.remove("animating");
    }


    /* ═══════════════════════════════════════════════
       4. LOGIQUE DU SLIDER
    ═══════════════════════════════════════════════ */

    /**
     * Navigue vers une slide donnée.
     * @param {number} targetIndex  - Index de la slide cible
     * @param {"right"|"left"} dir  - Direction de la transition
     */
    function goToSlide(targetIndex, dir = "right") {
        if (targetIndex === currentIndex) return;

        const current = slides[currentIndex];
        const target  = slides[targetIndex];

        // --- Sortie de la slide actuelle ---
        current.classList.remove("active");
        current.classList.add(dir === "right" ? "exit-left" : "exit-right");

        // --- Prépare la slide entrante depuis la gauche ---
        if (dir === "left") {
            target.classList.add("enter-left");
            void target.offsetWidth;
        }

        // --- Activation ---
        target.classList.add("active");

        // --- Mise à jour des dots ---
        dots[currentIndex].classList.remove("active");
        dots[currentIndex].setAttribute("aria-selected", "false");
        dots[targetIndex].classList.add("active");
        dots[targetIndex].setAttribute("aria-selected", "true");

        // --- Nettoyage après transition ---
        const TRANSITION_DURATION = 800;

        setTimeout(() => {
            current.classList.remove("exit-left", "exit-right");
            target.classList.remove("enter-left");
        }, TRANSITION_DURATION);

        currentIndex = targetIndex;

        restartAutoPlay();
        startProgress();
    }

    /** Slide suivante (boucle) */
    function nextSlide() {
        const next = (currentIndex + 1) % slides.length;
        goToSlide(next, "right");
    }

    /** Slide précédente (boucle) */
    function prevSlide() {
        const prev = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(prev, "left");
    }


    /* ═══════════════════════════════════════════════
       5. AUTOPLAY
    ═══════════════════════════════════════════════ */

    function startAutoPlay() {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = setTimeout(nextSlide, SLIDE_DELAY);
    }

    function stopAutoPlay() {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
    }

    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Pause au hover (desktop)
    sliderTrack?.addEventListener("mouseenter", () => {
        stopAutoPlay();
        stopProgress();
    });

    sliderTrack?.addEventListener("mouseleave", () => {
        startAutoPlay();
        startProgress();
    });


    /* ═══════════════════════════════════════════════
       6. DOTS
    ═══════════════════════════════════════════════ */

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const targetIndex = parseInt(dot.dataset.slide, 10);
            if (targetIndex === currentIndex) return;

            const dir = targetIndex > currentIndex ? "right" : "left";
            goToSlide(targetIndex, dir);
        });
    });


    /* ═══════════════════════════════════════════════
       7. SWIPE TACTILE (mobile)
    ═══════════════════════════════════════════════ */

    sliderTrack?.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        isDragging  = true;

        // Pause la progress bar pendant le swipe
        if (progressBar) {
            progressBar.style.animationPlayState = "paused";
        }
    }, { passive: true });

    sliderTrack?.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        touchEndX = e.changedTouches[0].clientX;
    }, { passive: true });

    sliderTrack?.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        if (progressBar) {
            progressBar.style.animationPlayState = "";
        }

        const delta = touchStartX - touchEndX;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;

        delta > 0 ? nextSlide() : prevSlide();
    });


    /* ═══════════════════════════════════════════════
       8. NAVIGATION CLAVIER
    ═══════════════════════════════════════════════ */

    document.addEventListener("keydown", (e) => {
        if (mobileMenu?.classList.contains("open")) return;

        if (e.key === "ArrowRight") { nextSlide(); }
        if (e.key === "ArrowLeft")  { prevSlide(); }
    });


    /* ═══════════════════════════════════════════════
       9. MENU MOBILE — SLIDER LATÉRAL
    ═══════════════════════════════════════════════ */

    function openMenu() {
        mobileMenu?.classList.add("open");
        burger?.classList.add("open");
        overlay?.classList.add("open");

        burger?.setAttribute("aria-expanded", "true");
        mobileMenu?.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        setTimeout(() => menuClose?.focus(), 50);

        stopAutoPlay();
        stopProgress();
    }

    function closeMenu() {
        mobileMenu?.classList.remove("open");
        burger?.classList.remove("open");
        overlay?.classList.remove("open");

        burger?.setAttribute("aria-expanded", "false");
        mobileMenu?.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        burger?.focus();

        startAutoPlay();
        startProgress();
    }

    burger?.addEventListener("click", () => {
        const isOpen = mobileMenu?.classList.contains("open");
        isOpen ? closeMenu() : openMenu();
    });

    menuClose?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu?.classList.contains("open")) {
            closeMenu();
        }
    });

    mobileMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    /**
     * Focus trap dans le menu mobile ouvert.
     */
    mobileMenu?.addEventListener("keydown", (e) => {
        if (e.key !== "Tab" || !mobileMenu.classList.contains("open")) return;

        const focusables = Array.from(
            mobileMenu.querySelectorAll(
                'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            )
        ).filter((el) => !el.disabled && el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last  = focusables[focusables.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });


    /* ═══════════════════════════════════════════════
       10. INITIALISATION
    ═══════════════════════════════════════════════ */

    startAutoPlay();
    startProgress();

});