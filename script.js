(function () {
    const $ = (id) => document.getElementById(id);

    const src = $("src");
    const out = $("out");
    const status = $("status");

    // Matches a leading timestamp: [mm:ss.xx], [mm:ss], mm:ss, h:mm:ss, (m:ss), <m:ss> ...
    const STAMP = /^\s*[\[\(<]?\s*(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?\s*[\]\)>]?/;

    // Parse one line into { times: [ms, ...], text } or null if it has no timestamp.
    function parseLine(line) {
        const times = [];
        let rest = line;
        let m;

        while ((m = rest.match(STAMP))) {
            const bracketed = /^\s*[\[\(<]/.test(rest);
            const hasHours = m[1] !== undefined;
            const h = hasHours ? parseInt(m[1], 10) : 0;
            const min = parseInt(m[2], 10);
            const sec = parseInt(m[3], 10);

            if (sec > 59 || (hasHours && min > 59)) break;

            // ".5" -> 500 ms, ".50" -> 500 ms, ".500" -> 500 ms
            const ms = m[4] ? parseInt((m[4] + "00").slice(0, 3), 10) : 0;
            times.push(((h * 60 + min) * 60 + sec) * 1000 + ms);

            rest = rest.slice(m[0].length);
            // Only keep reading stamps if they were bracketed,e.g. [00:12][01:05] Chorus
            if (!bracketed) break;
        }

        if (!times.length) return null;
        return { times, text: rest.replace(/^\s*[-–—:|]\s*/, "").trim() };
    }

    // Format milliseconds as [mm:ss.xx] or [mm:ss.xxx].
    function format(ms, precision) {
        const mm = Math.floor(ms / 60000);
        const ss = Math.floor((ms % 60000) / 1000);
        const frac = ms % 1000;
        const fracStr = precision === 3
            ? String(frac).padStart(3, "0")
            : String(Math.floor(frac / 10)).padStart(2, "0");
        return `[${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${fracStr}]`;
    }

    function convert() {
        const precision = parseInt($("prec").value, 10);
        const rows = [];
        const tags = {};
        let skipped = 0;

        src.value.split(/\r?\n/).forEach((raw) => {
            const line = raw.trim();
            if (!line) return;

            // Keep existing [ti:], [ar:], [al:] tags from the input
            const tag = line.match(/^\[(ti|ar|al):(.*)\]$/i);
            if (tag) {
                tags[tag[1].toLowerCase()] = tag[2].trim();
                return;
            }

            const parsed = parseLine(line);
            if (!parsed) {
                skipped++;
                return;
            }
            parsed.times.forEach((ms) => rows.push({ ms, text: parsed.text }));
        });

        rows.sort((a, b) => a.ms - b.ms);

        // Header: typed fields win over tags found in the input
        const header = [];
        ["ti", "ar", "al"].forEach((key) => {
            const value = $(key).value.trim() || tags[key] || "";
            if (value) header.push(`[${key}:${value}]`);
        });

        const lines = header.concat(rows.map((r) => format(r.ms, precision) + r.text));
        out.value = lines.join("\n");

        status.classList.toggle("warn", skipped > 0);
        status.textContent = src.value.trim()
            ? `${rows.length} lines converted` + (skipped ? `, ${skipped} skipped (no time found)` : "")
            : "";
    }

    // Convert live as the user types or changes an option
    ["src", "ti", "ar", "al", "prec"].forEach((id) => {
        $(id).addEventListener("input", convert);
    });

    // Load sample
    $("sample").addEventListener("click", () => {
        src.value = [
            "0:08 Walking down an empty street",
            "0:14.50 Streetlights hum a quiet beat",
            "[00:21] Every window holds a story",
            "[00:27.8] Every shadow knows my name",
            "1:05 - Chorus line goes here",
            "[01:05][02:10] Repeated chorus"
        ].join("\n");
        convert();
    });

    // Open a .txt file
    $("file").addEventListener("click", () => $("picker").click());
    $("picker").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            src.value = reader.result;
            if (!$("ti").value) $("ti").value = file.name.replace(/\.[^.]+$/, "");
            convert();
        };
        reader.readAsText(file);
        e.target.value = ""; // allow re-opening the same file
    });

    // Copy output
    $("copy").addEventListener("click", async () => {
        if (!out.value) return;
        try {
            await navigator.clipboard.writeText(out.value);
        } catch (err) {
            out.select();
            document.execCommand("copy");
        }
        status.classList.remove("warn");
        status.textContent = "Copied to clipboard";
    });

    // Download as .lrc
    $("dl").addEventListener("click", () => {
        if (!out.value) return;
        const name = ($("ti").value.trim() || "lyrics").replace(/[\\/:*?"<>|]/g, "_") + ".lrc";
        const url = URL.createObjectURL(new Blob([out.value], { type: "text/plain;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
})();