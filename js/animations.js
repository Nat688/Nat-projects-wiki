/* =====================================
   NAT'S PROJECTS - ANIMATIONS
   ===================================== */


/* ===== SCROLL REVEAL ===== */

const animatedElements = document.querySelectorAll(
    ".fade-up, .fade-in, .fade-down"
);

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(
                    "visible"
                );
                observer.unobserve(
                    entry.target
                );
            }
        });
    },
    {
        threshold: .15
    }
);

animatedElements.forEach(element => {
    element.classList.remove(
        "visible"
    );
    observer.observe(element);
});

/* ===== PARALLAX BACKGROUND ===== */

window.addEventListener(
    "scroll",
    () => {
        const scroll =
            window.scrollY * .02;
        document.documentElement.style
            .setProperty(
                "--scroll",
                `${scroll}%`
            );
    }
);
