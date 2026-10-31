const puppeteer = require("puppeteer");

async function check() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err));

  console.log("Navigating to http://localhost:1420...");
  await page.goto("http://localhost:1420", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2000));

  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY HTML LENGTH:", bodyHtml.length);
  console.log("BODY HTML PREVIEW:", bodyHtml.slice(0, 500));

  await browser.close();
}

check().catch(console.error);
