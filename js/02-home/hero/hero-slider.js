document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       ELEMENTS
    =============================== */

    const slides      = document.querySelectorAll(".hero-slide");
    const dots        = document.querySelectorAll(".dot");
    const slider      = document.querySelector(".hero-slides");
    const burger      = document.querySelector(".burger");
    const mobileMenu  = document.getElementById("mobile-menu");

    let currentIndex   = 0;
    let autoPlayTimer  = null;
    const slideDuration = 8000;

    let startX = 0;
    let endX   = 0;


    /* ===============================
       GO TO SLIDE (DIRECTIONAL)
    =============================== */

    function goToSlide(index, direction = "right") {

        if (index === currentIndex) return;

        const currentSlide = slides[currentIndex];
        const nextSlide    = slides[index];

        // Retire le slide actuel
        currentSlide.classList.remove("active");

        if (direction === "right") {
            currentSlide.classList.add("exit-left");
        } else {
            // On prépare la slide suivante à entrer par la gauche
            nextSlide.classList.add("enter-left");
        }

        // Force reflow pour relancer les transitions CSS proprement
        void nextSlide.offsetWidth;

        nextSlide.classList.add("active");

        // Mise à jour des dots
        dots[currentIndex].classList.remove("active");
        dots[currentIndex].setAttribute("aria-selected", "false");
        dots[index].classList.add("active");
        dots[index].setAttribute("aria-selected", "true");

        // Nettoyage des classes temporaires après la transition
        setTimeout(() => {
            currentSlide.classList.remove("exit-left");
            nextSlide.classList.remove("enter-left");
        }, 800);

        currentIndex = index;
        restartAutoPlay();
    }

    function nextSlide() {
        let next = currentIndex + 1;
        if (next >= slides.length) next = 0;
        goToSlide(next, "right");
    }

    function prevSlide() {
        let prev = currentIndex - 1;
        if (prev < 0) prev = slides.length - 1;
        goToSlide(prev, "left");
    }


    /* ===============================
       AUTOPLAY
    =============================== */

    function startAutoPlay() {
        autoPlayTimer = setTimeout(() => {
            nextSlide();
        }, slideDuration);
    }

    function restartAutoPlay() {
        clearTimeout(autoPlayTimer);
        startAutoPlay();
    }


    /* ===============================
       DOT EVENTS
    =============================== */

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const index = parseInt(dot.dataset.slide);
            const direction = index > currentIndex ? "right" : "left";
            goToSlide(index, direction);
        });
    });


    /* ===============================
       SWIPE MOBILE
    =============================== */

    slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = startX - endX;
        if (Math.abs(diff) < 50) return;
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }


    /* ===============================
       BURGER MENU
    =============================== */

    if (burger && mobileMenu) {
        burger.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");
            burger.classList.toggle("open", isOpen);
            burger.setAttribute("aria-expanded", String(isOpen));
        });

        // Ferme le menu au clic sur un lien
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                burger.classList.remove("open");
                burger.setAttribute("aria-expanded", "false");
            });
        });

        // Ferme le menu au clic à l'extérieur
        document.addEventListener("click", (e) => {
            if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove("open");
                burger.classList.remove("open");
                burger.setAttribute("aria-expanded", "false");
            }
        });
    }


    /* ===============================
       START
    =============================== */

    startAutoPlay();

});
