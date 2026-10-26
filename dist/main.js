function start() {
    const canvas = document.getElementById("scene");
    const color = document.getElementById("color");
    const toggle = document.getElementById("toggle");
    const reset = document.getElementById("reset");
    const status = document.getElementById("status");
    const selector = document.getElementById("selected");
    const speedInput = document.getElementById("speed");
    const apply = document.getElementById("apply");
    const message = document.getElementById("message");
    if (!(canvas instanceof HTMLCanvasElement) ||
        !(color instanceof HTMLInputElement) ||
        !(toggle instanceof HTMLButtonElement) ||
        !(reset instanceof HTMLButtonElement) ||
        !(selector instanceof HTMLSelectElement) ||
        !(speedInput instanceof HTMLInputElement) ||
        !(apply instanceof HTMLButtonElement) ||
        !(message instanceof HTMLParagraphElement) ||
        !(status instanceof HTMLParagraphElement)) {
        throw new Error("Required page elements are missing");
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null)
        throw new Error("Canvas 2D is unavailable");
    const initialCircles = [
        { x: 80, y: 80, radius: 20, color: "#2563eb", vx: 120, vy: 90 },
        { x: 300, y: 180, radius: 25, color: "#dc2626", vx: -100, vy: 70 },
        { x: 500, y: 280, radius: 15, color: "#16a34a", vx: 80, vy: -110 }
    ];
    const circles = initialCircles.map((c) => ({ ...c }));
    let selectedIndex = 0;
    let running = true;
    const getSelected = () => circles[selectedIndex];
    const clamp = (v, low, high) => Math.max(low, Math.min(v, high));
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const c of circles) {
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
        const selected = getSelected();
        if (selected !== undefined) {
            status.textContent =
                `circle ${selectedIndex + 1}: ` +
                    `x=${selected.x.toFixed(1)}, y=${selected.y.toFixed(1)} ` +
                    `| ${running ? "running" : "paused"}`;
        }
    };
    color.addEventListener("input", () => {
        const selected = getSelected();
        if (selected === undefined)
            return;
        selected.color = color.value;
    });
    selector.addEventListener("change", () => {
        const index = Number(selector.value);
        const chosen = circles[index];
        if (chosen === undefined)
            return;
        selectedIndex = index;
        color.value = chosen.color;
    });
    apply.addEventListener("click", () => {
        const selected = getSelected();
        if (selected === undefined)
            return;
        const raw = speedInput.value.trim();
        const speed = Number(raw);
        if (raw === "" || !Number.isFinite(speed) || speed < 0) {
            message.textContent = "Enter a nonnegative number";
            return;
        }
        const direction = selected.vx < 0 ? -1 : 1;
        selected.vx = direction * speed;
        message.textContent = `Speed applied: ${speed}`;
    });
    toggle.addEventListener("click", () => {
        running = !running;
        toggle.textContent = running ? "Pause" : "Resume";
    });
    reset.addEventListener("click", () => {
        circles.splice(0, circles.length, ...initialCircles.map((c) => ({ ...c })));
        selectedIndex = 0;
        selector.value = "0";
        const first = getSelected();
        if (first !== undefined) {
            color.value = first.color;
            speedInput.value = String(Math.abs(first.vx));
        }
        running = false;
        toggle.textContent = "Resume";
        message.textContent = "";
    });
    canvas.addEventListener("pointerdown", (event) => {
        const selected = getSelected();
        if (selected === undefined)
            return;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) *
            canvas.width / bounds.width;
        const y = (event.clientY - bounds.top) *
            canvas.height / bounds.height;
        selected.x = clamp(x, selected.radius, canvas.width - selected.radius);
        selected.y = clamp(y, selected.radius, canvas.height - selected.radius);
    });
    let previous;
    const frame = (now) => {
        const dt = previous === undefined ? 0 :
            Math.min((now - previous) / 1000, 0.05);
        previous = now;
        if (running) {
            for (const c of circles) {
                c.x += c.vx * dt;
                c.y += c.vy * dt;
                if (c.x > canvas.width - c.radius) {
                    c.x = canvas.width - c.radius;
                    c.vx = -Math.abs(c.vx);
                }
                else if (c.x < c.radius) {
                    c.x = c.radius;
                    c.vx = Math.abs(c.vx);
                }
                if (c.y > canvas.height - c.radius) {
                    c.y = canvas.height - c.radius;
                    c.vy = -Math.abs(c.vy);
                }
                else if (c.y < c.radius) {
                    c.y = c.radius;
                    c.vy = Math.abs(c.vy);
                }
            }
        }
        draw();
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
start();
export {};
//# sourceMappingURL=main.js.map