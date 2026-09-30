(() => {
    "use strict";

    /* Mobile navigation */
    const toggle = document.querySelector(".nav-toggle");
    const links = document.getElementById("nav-links");

    const setMenu = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
        links.classList.toggle("open", open);
    };

    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
})();

/* Scroll reveal */
(() => {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }

    document.documentElement.classList.add("js");
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 3) * 80}ms`;
        io.observe(el);
    });
})();

/* Theme toggle (dark default, persisted) */
(() => {
    const root = document.documentElement;
    const btn = document.querySelector(".theme-toggle");
    const meta = document.querySelector('meta[name="theme-color"]');

    const apply = (theme) => {
        root.dataset.theme = theme;
        if (meta) meta.content = theme === "light" ? "#f6f8fb" : "#0b0f14";
    };
    if (root.dataset.theme) apply(root.dataset.theme);

    btn.addEventListener("click", () => {
        const next = root.dataset.theme === "light" ? "dark" : "light";
        apply(next);
        try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
    });
})();

/* Highlight the nav link of the section in view */
(() => {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    const map = new Map();
    links.forEach((a) => {
        const sec = document.querySelector(a.getAttribute("href"));
        if (sec) map.set(sec, a);
    });
    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = map.get(entry.target);
            if (link && entry.isIntersecting) {
                links.forEach((l) => l.removeAttribute("aria-current"));
                link.setAttribute("aria-current", "true");
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
})();

/* Current year in footer */
(() => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
})();

/* Scroll progress bar */
(() => {
    const bar = document.querySelector(".progress");
    if (!bar) return;
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
})();
