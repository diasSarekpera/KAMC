document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".dot");
    const slider = document.querySelector(".hero-slides");

    let currentIndex = 0;
    let autoPlayTimer = null;
    const slideDuration = 8000;

    let startX = 0;
    let endX = 0;

    /* ===============================
       GO TO SLIDE (DIRECTIONAL)
    =============================== */

    function goToSlide(index, direction = "right"){

        if(index === currentIndex) return;

        const currentSlide = slides[currentIndex];
        const nextSlide = slides[index];

        currentSlide.classList.remove("active");

        if(direction === "right"){
            currentSlide.classList.add("exit-left");
        } else {
            nextSlide.classList.add("enter-left");
        }

        nextSlide.classList.add("active");

        dots[currentIndex].classList.remove("active");
        dots[index].classList.add("active");

        setTimeout(() => {
            currentSlide.classList.remove("exit-left");
            nextSlide.classList.remove("enter-left");
        }, 800);

        currentIndex = index;
        restartAutoPlay();
    }

    function nextSlide(){
        let next = currentIndex + 1;
        if(next >= slides.length) next = 0;
        goToSlide(next, "right");
    }

    function prevSlide(){
        let prev = currentIndex - 1;
        if(prev < 0) prev = slides.length - 1;
        goToSlide(prev, "left");
    }

    /* ===============================
       AUTOPLAY
    =============================== */

    function startAutoPlay(){
        autoPlayTimer = setTimeout(() => {
            nextSlide();
        }, slideDuration);
    }

    function restartAutoPlay(){
        clearTimeout(autoPlayTimer);
        startAutoPlay();
    }

    /* ===============================
       DOT EVENTS
    =============================== */

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const index = parseInt(dot.dataset.slide);
            if(index > currentIndex){
                goToSlide(index, "right");
            } else {
                goToSlide(index, "left");
            }
        });
    });

    /* ===============================
       SWIPE MOBILE
    =============================== */

    slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe(){
        const diff = startX - endX;

        if(Math.abs(diff) < 50) return;

        if(diff > 0){
            nextSlide();
        } else {
            prevSlide();
        }
    }

    /* ===============================
       START
    =============================== */

    startAutoPlay();

});
