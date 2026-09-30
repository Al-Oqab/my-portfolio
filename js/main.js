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
