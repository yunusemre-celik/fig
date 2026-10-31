const fs = require('fs');
const path = require('path');

const landingDistDir = path.resolve(__dirname, '../dist');
const docsDir = path.resolve(__dirname, '../../docs');

const languages = {
  tr: {
    lang: 'tr',
    locale: 'tr_TR',
    title: 'Fig - Bu Çark Zaman Kazandırıyor | Dosya Araç Kiti',
    description: 'Hayır, saat çarkı değil; işlem çarkı. Rust ile geliştirilmiş yerel, %100 çevrimdışı ve ultra hızlı dosya dönüştürme aracı.',
    url: 'https://yunusemre-celik.github.io/fig/tr/',
  },
  en: {
    lang: 'en',
    locale: 'en_US',
    title: 'Fig - This Wheel Saves Your Time | File Toolkit',
    description: 'No, not a clock gear; an action wheel. Ultra-fast, 100% offline local file converter and desktop toolkit powered by Rust.',
    url: 'https://yunusemre-celik.github.io/fig/en/',
  },
  es: {
    lang: 'es',
    locale: 'es_ES',
    title: 'Fig - Esta Rueda Te Ahorra Tiempo | Kit de Herramientas de Archivos',
    description: 'No, no es un reloj; es una rueda de acciones. Conversor de archivos local, 100% offline y ultrarrápido creado con Rust.',
    url: 'https://yunusemre-celik.github.io/fig/es/',
  },
  de: {
    lang: 'de',
    locale: 'de_DE',
    title: 'Fig - Dieses Rad Spart Dir Zeit | Datei-Toolkit',
    description: 'Nein, kein Uhrwerk; ein Aktionsrad. Ultraschneller, 100% offline lokaler Dateikonverter und Desktop-Toolkit mit Rust.',
    url: 'https://yunusemre-celik.github.io/fig/de/',
  },
  fr: {
    lang: 'fr',
    locale: 'fr_FR',
    title: 'Fig - Cette Roue Vous Fait Gagner du Temps | Boîte à Outils Fichiers',
    description: "Non, pas une horloge ; une roue d'actions. Convertisseur de fichiers local, 100% hors ligne et ultra rapide propulsé par Rust.",
    url: 'https://yunusemre-celik.github.io/fig/fr/',
  },
};

function main() {
  console.log('🚀 Generating multi-language landing preview pages...');

  const baseHtmlPath = path.join(landingDistDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('Error: landing/dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

  // Ensure og-image.png is copied into dist
  const publicOgImage = path.resolve(__dirname, '../public/og-image.png');
  const distOgImage = path.join(landingDistDir, 'og-image.png');
  if (fs.existsSync(publicOgImage) && !fs.existsSync(distOgImage)) {
    fs.copyFileSync(publicOgImage, distOgImage);
  }

  // 1. Generate language subpages in landing/dist/<lang>/index.html
  for (const [code, meta] of Object.entries(languages)) {
    const langDir = path.join(landingDistDir, code);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    let localizedHtml = baseHtml;
    // Replace html lang
    localizedHtml = localizedHtml.replace(/<html\s+lang="[^"]*"/i, `<html lang="${meta.lang}"`);
    // Replace title
    localizedHtml = localizedHtml.replace(/<title>[^<]*<\/title>/i, `<title>${meta.title}</title>`);
    localizedHtml = localizedHtml.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${meta.title}" />`);
    // Replace description
    localizedHtml = localizedHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${meta.description}" />`);
    // Replace canonical
    localizedHtml = localizedHtml.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${meta.url}" />`);
    // Replace Open Graph tags
    localizedHtml = localizedHtml.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${meta.url}" />`);
    localizedHtml = localizedHtml.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${meta.title}" />`);
    localizedHtml = localizedHtml.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${meta.description}" />`);
    localizedHtml = localizedHtml.replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale" content="${meta.locale}" />`);
    // Replace Twitter Card tags
    localizedHtml = localizedHtml.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${meta.url}" />`);
    localizedHtml = localizedHtml.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${meta.title}" />`);
    localizedHtml = localizedHtml.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${meta.description}" />`);

    // Adjust relative asset paths for 1 folder depth (./ -> ../)
    localizedHtml = localizedHtml.replace(/href="\.\/favicon\.svg"/g, 'href="../favicon.svg"');
    localizedHtml = localizedHtml.replace(/href="\.\/assets\//g, 'href="../assets/');
    localizedHtml = localizedHtml.replace(/src="\.\/assets\//g, 'src="../assets/');

    fs.writeFileSync(path.join(langDir, 'index.html'), localizedHtml, 'utf8');
    console.log(`  ✓ Created localized preview page for [${code.toUpperCase()}] at dist/${code}/index.html`);
  }

  // 2. Deploy to docs/ directory safely (DO NOT TOUCH release binaries or .nojekyll or preview archives)
  console.log('\n📦 Syncing to docs/ directory for GitHub Pages...');

  // Protected files that must never be removed or overwritten
  const protectedDocsItems = new Set([
    'Fig.exe',
    'Fig-Windows-x64.zip',
    '.nojekyll',
    'CNAME',
    'preview',
    'index.figma-obsidian.html',
  ]);

  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcItem = path.join(src, item);
      const destItem = path.join(dest, item);
      const stat = fs.statSync(srcItem);

      if (stat.isDirectory()) {
        copyRecursive(srcItem, destItem);
      } else {
        const basename = path.basename(destItem);
        if (dest === docsDir && protectedDocsItems.has(basename)) {
          console.log(`  [SKIP protected binary] ${basename}`);
          continue;
        }
        fs.copyFileSync(srcItem, destItem);
      }
    }
  }

  copyRecursive(landingDistDir, docsDir);

  console.log('\n✅ Successfully deployed multi-language landing page to docs/!\n');
}

main();
