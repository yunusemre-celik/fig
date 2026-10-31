const puppeteer = require("puppeteer");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");

const OUTPUT_DIR = path.join(os.homedir(), "Desktop", "Fig_Screenshots");

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            retry();
          }
        })
        .on("error", () => {
          retry();
        });
    };

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Timeout waiting for server: " + url));
      } else {
        setTimeout(check, 300);
      }
    };

    check();
  });
}

async function hoverElement(page, selectorOrFn) {
  let point;
  if (typeof selectorOrFn === "string") {
    point = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, selectorOrFn);
  } else {
    point = await page.evaluate(selectorOrFn);
  }

  if (point) {
    await page.mouse.move(point.x, point.y);
  }
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Checking if Vite dev server is running on port 1420...");
  let viteProcess = null;
  const devUrl = "http://localhost:1420";

  try {
    await waitForServer(devUrl, 1000);
    console.log("Vite dev server is already running.");
  } catch {
    console.log("Starting Vite dev server...");
    const isWindows = process.platform === "win32";
    const npxCmd = isWindows ? "npx.cmd" : "npx";
    viteProcess = spawn(npxCmd, ["vite", "--port", "1420", "--strictPort"], {
      stdio: "pipe",
      shell: isWindows,
    });
    await waitForServer(devUrl, 25000);
    console.log("Vite dev server is ready!");
  }

  console.log("Launching Puppeteer with Retina 2x scale (2880x1800)...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2, // 2880x1800 Ultra-Crisp Retina
    },
  });

  const page = await browser.newPage();
  await page.goto(devUrl, { waitUntil: "networkidle0" });

  // Wait for React app to fully mount
  await page.waitForSelector(".workspace-shell", { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1200));

  // ==========================================
  // 1. ANA SAYFA & BAŞLIK ÇUBUĞU
  // ==========================================
  console.log("Capturing 01_Ana_Sayfa_Workspace.png...");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01_Ana_Sayfa_Workspace.png"),
  });

  // ==========================================
  // 2. FİG MENÜSÜ AŞAMALARI
  // ==========================================
  console.log("Capturing 02_Fig_Menusu_Acik.png...");
  await page.evaluate(() => {
    const btn = document.querySelector("header button");
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02_Fig_Menusu_Acik.png"),
  });

  console.log("Capturing 03_Fig_Menusu_CloseUp.png (LinkedIn Hero)...");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03_Fig_Menusu_CloseUp.png"),
    clip: { x: 0, y: 0, width: 340, height: 530 },
  });

  // Close menu by clicking again
  await page.evaluate(() => {
    const btn = document.querySelector("header button");
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // ==========================================
  // 3. ÇARK TETİKLEYİCİ BUTONU (SIDEBAR)
  // ==========================================
  console.log("Capturing 04_Cark_Tetikleyici_Hover.png...");
  await hoverElement(page, () => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((b) => b.textContent.includes("İşlem Çarkını Aç") || b.textContent.includes("Trigger Wheel"));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04_Cark_Tetikleyici_Hover.png"),
  });

  // ==========================================
  // 4. ÇARKIN TÜM AŞAMALARI (RADIAL WHEEL)
  // ==========================================
  console.log("Opening Radial Wheel...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((b) => b.textContent.includes("İşlem Çarkını Aç") || b.textContent.includes("Trigger Wheel"));
    if (b) b.click();
  });

  // Wait for wheel SVG to be rendered
  await page.waitForSelector("svg g.cursor-pointer", { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 600));

  console.log("Capturing 05_Cark_Ofis_Profili.png...");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05_Cark_Ofis_Profili.png"),
  });

  // Wheel center close-up
  const wheelBox = await page.evaluate(() => {
    const svg = document.querySelector("svg.transform.-rotate-90") || document.querySelector("svg");
    if (!svg) return { x: 440, y: 170, width: 560, height: 560 };
    const r = svg.getBoundingClientRect();
    return { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 20), width: r.width + 40, height: r.height + 40 };
  });

  console.log("Capturing 05b_Cark_Ofis_CloseUp.png...");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05b_Cark_Ofis_CloseUp.png"),
    clip: wheelBox,
  });

  // Hover over first slice (WebP / Image)
  console.log("Capturing 06_Cark_Dilim_Hover_WebP.png...");
  await hoverElement(page, () => {
    const slices = document.querySelectorAll("svg g.cursor-pointer");
    if (!slices || slices.length === 0) return null;
    const r = slices[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06_Cark_Dilim_Hover_WebP.png"),
  });

  // Hover over second slice (PDF / Document)
  console.log("Capturing 07_Cark_Dilim_Hover_PDF.png...");
  await hoverElement(page, () => {
    const slices = document.querySelectorAll("svg g.cursor-pointer");
    if (!slices || slices.length < 2) return null;
    const r = slices[1].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07_Cark_Dilim_Hover_PDF.png"),
  });

  console.log("Capturing 07b_Cark_Dilim_Hover_CloseUp.png...");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07b_Cark_Dilim_Hover_CloseUp.png"),
    clip: wheelBox,
  });

  // Cycle to Design Profile
  console.log("Capturing 08_Cark_Tasarim_Profili.png...");
  await page.evaluate(() => {
    const nextBtn = document.querySelector('button[title*="Next"]');
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "08_Cark_Tasarim_Profili.png"),
  });

  // Cycle to Dev Profile
  console.log("Capturing 09_Cark_Gelistirici_Profili.png...");
  await page.evaluate(() => {
    const nextBtn = document.querySelector('button[title*="Next"]');
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "09_Cark_Gelistirici_Profili.png"),
  });

  // Cycle to Custom Profile
  console.log("Capturing 10_Cark_Ozel_Profil.png...");
  await page.evaluate(() => {
    const nextBtn = document.querySelector('button[title*="Next"]');
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "10_Cark_Ozel_Profil.png"),
  });

  // Close Wheel by pressing Escape
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));

  // ==========================================
  // 5. ÇARK STÜDYOSU (WHEEL STUDIO PANEL)
  // ==========================================
  console.log("Capturing 11_Cark_Studyosu_Yonetimi.png...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((b) => b.textContent.includes("Çark Stüdyosu") || b.textContent.includes("Wheel Studio"));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "11_Cark_Studyosu_Yonetimi.png"),
  });

  // ==========================================
  // 6. BELGELER & PDF ARAÇLARI
  // ==========================================
  console.log("Capturing 12_Belgeler_ve_PDF_Araclari.png...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((b) => b.textContent.includes("Belgeler") || b.textContent.includes("Documents"));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "12_Belgeler_ve_PDF_Araclari.png"),
  });

  // ==========================================
  // 7. AYARLAR GÖRÜNÜMÜ
  // ==========================================
  console.log("Capturing 13_Ayarlar_Paneli.png...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((b) => b.textContent.includes("Ayarlar") || b.textContent.includes("Settings"));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "13_Ayarlar_Paneli.png"),
  });

  // Return to Home
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((b) => b.textContent.includes("Ana Sayfa") || b.textContent.includes("Quick Convert"));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // ==========================================
  // 8. BENTO HIZLI EYLEMLER YAKIN ÇEKİM
  // ==========================================
  console.log("Capturing 14_Bento_Hizli_Eylemler_CloseUp.png...");
  const bentoClip = await page.evaluate(() => {
    const el = document.querySelector(".grid.grid-cols-2");
    if (!el) return { x: 260, y: 530, width: 920, height: 180 };
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 12), y: Math.max(0, r.y - 12), width: r.width + 24, height: r.height + 24 };
  });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "14_Bento_Hizli_Eylemler_CloseUp.png"),
    clip: bentoClip,
  });

  // ==========================================
  // 9. MODALLAR (KIRPMA & QR)
  // ==========================================
  console.log("Capturing 15_Image_Studio_Kirpma_Modali.png...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const cropBtn = btns.find((b) => b.textContent.includes("Kırp") || b.textContent.includes("Crop"));
    if (cropBtn) cropBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "15_Image_Studio_Kirpma_Modali.png"),
  });
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));

  console.log("Capturing 16_QR_Kod_Modali.png...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const qrBtn = btns.find((b) => b.textContent.includes("QR Code") || b.textContent.includes("QR"));
    if (qrBtn) qrBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "16_QR_Kod_Modali.png"),
  });
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));

  // ==========================================
  // 10. BAĞIMSIZ FLOATING WHEEL PENCERESİ
  // ==========================================
  console.log("Capturing 17_Floating_Wheel_Standalone.png...");
  await page.goto(`${devUrl}?window=wheel`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "17_Floating_Wheel_Standalone.png"),
    omitBackground: true,
  });

  console.log("SUCCESS! All showcase screenshots captured directly to:", OUTPUT_DIR);

  await browser.close();
  if (viteProcess) {
    console.log("Stopping Vite process...");
    viteProcess.kill();
  }
}

run().catch((err) => {
  console.error("Error in capture_showcase:", err);
  process.exit(1);
});
