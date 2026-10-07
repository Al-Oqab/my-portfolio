/* GitHub Commits Tracker: live data from GitHub when reachable, otherwise the bundled snapshot. */
(() => {
    "use strict";

    const root = document.getElementById("github-widget");
    if (!root) return;

    const user = root.dataset.user;
    const WEEKS = 26;
    const $ = (key) => root.querySelector(`[data-gh="${key}"]`);
    const snap = window.GH_SNAPSHOT;

    const getJSON = async (url) => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        try {
            const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(res.status);
            return await res.json();
        } finally { clearTimeout(timer); }
    };

    const ago = (iso) => {
        const s = Math.max(1, (Date.now() - new Date(iso)) / 1000);
        const units = [[31536000, "Jahr", "Jahren"], [2592000, "Monat", "Monaten"], [604800, "Woche", "Wochen"], [86400, "Tag", "Tagen"], [3600, "Std.", "Std."], [60, "Min.", "Min."]];
        for (const [sec, one, many] of units) {
            const n = Math.floor(s / sec);
            if (n >= 1) return `vor ${n} ${n === 1 ? one : many}`;
        }
        return "gerade eben";
    };

    const levelOf = (c) => (c === 0 ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 10 ? 3 : 4);

    const renderMap = (days) => {
        const map = $("map");
        map.replaceChildren();
        const recent = days.slice(-WEEKS * 7);
        const lead = new Date(recent[0].date + "T00:00:00").getDay(); // 0 = Sunday = first row
        for (let i = 0; i < lead; i++) map.appendChild(document.createElement("span"));
        recent.forEach((d) => {
            const cell = document.createElement("i");
            cell.className = `lv${d.level ?? levelOf(d.count)}`;
            cell.title = `${d.count} Beitrag${d.count === 1 ? "" : "e"} am ${new Date(d.date + "T00:00:00").toLocaleDateString("de-DE")}`;
            map.appendChild(cell);
        });
        map.parentElement.scrollLeft = map.parentElement.scrollWidth;
    };

    const renderCommits = (items) => {
        const list = $("commits");
        list.replaceChildren();
        if (!items.length) {
            const li = document.createElement("li");
            li.className = "gh-empty";
            li.textContent = "Noch keine öffentlichen Commits.";
            list.appendChild(li);
            return;
        }
        items.slice(0, 6).forEach((c) => {
            const li = document.createElement("li");
            const msg = document.createElement("span");
            msg.className = "gh-msg";
            msg.textContent = c.message;
            msg.title = c.message;
            const time = document.createElement("time");
            time.dateTime = c.date;
            time.textContent = ago(c.date);
            li.append(msg, time);
            list.appendChild(li);
        });
    };

    const setText = (key, value) => { const el = $(key); if (el) el.textContent = value; };

    const fromSnapshot = () => {
        if (!snap) return false;
        setText("repos", snap.repos);
        setText("followers", snap.followers);
        setText("total", snap.total);
        renderMap(snap.contributions);
        renderCommits(snap.commits);
        setText("source", "Offline-Ansicht: Commits dieses Repositories (Stand " + new Date(snap.generated).toLocaleDateString("de-DE") + ").");
        return true;
    };

    (async () => {
        fromSnapshot(); // instant, never blank

        let live = 0;
        const [profile, contrib, events] = await Promise.allSettled([
            getJSON(`https://api.github.com/users/${user}`),
            getJSON(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`),
            getJSON(`https://api.github.com/users/${user}/events/public?per_page=30`),
        ]);

        if (profile.status === "fulfilled") {
            setText("repos", profile.value.public_repos);
            setText("followers", profile.value.followers);
            live++;
        }
        if (contrib.status === "fulfilled" && Array.isArray(contrib.value.contributions)) {
            const days = contrib.value.contributions;
            renderMap(days);
            setText("total", days.reduce((n, d) => n + d.count, 0));
            live++;
        }
        if (events.status === "fulfilled" && Array.isArray(events.value)) {
            const commits = events.value
                .filter((e) => e.type === "PushEvent")
                .flatMap((e) => (e.payload.commits || []).map((c) => ({ message: c.message.split("\n")[0], date: e.created_at })))
                ;
            if (commits.length) { renderCommits(commits); live++; }
        }
        if (live) setText("source", "Live-Daten von GitHub (@" + user + ").");
    })();
})();
