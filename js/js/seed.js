// ── SCRIPT DE CARGA MASIVA ─────────────────────────────────────────────
// Pega esto en la consola del navegador estando en admin.html logueado

(async function() {
  const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

  const firebaseConfig = {
    apiKey: "AIzaSyAGIjtHa251FpHMtF4LW2iD8Yz-JtyB67Y",
    authDomain: "alfredostore-19858.firebaseapp.com",
    projectId: "alfredostore-19858",
    storageBucket: "alfredostore-19858.firebasestorage.app",
    messagingSenderId: "503517454506",
    appId: "1:503517454506:web:7bbfb0f593a379227930d3"
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db  = getFirestore(app);

  // ── MARCAS ──────────────────────────────────────────────────────────
  const MARCAS = [
    { nombre: "iPhone",       subtitulo: "Apple · Serie Pro Max",                        orden: 1  },
    { nombre: "Samsung",      subtitulo: "Galaxy A · S · Ultra Series",                  orden: 2  },
    { nombre: "Infinix",      subtitulo: "Smart · Hot · Note Series",                    orden: 3  },
    { nombre: "Tecno",        subtitulo: "Spark · Camon Series",                         orden: 4  },
    { nombre: "Honor",        subtitulo: "Play · X · Magic Series",                      orden: 5  },
    { nombre: "Xiaomi",       subtitulo: "Redmi · Note · Pro Series",                    orden: 6  },
    { nombre: "ZTE",          subtitulo: "Blade Series",                                 orden: 7  },
    { nombre: "Vivo",         subtitulo: "Y Series",                                     orden: 8  },
    { nombre: "Laptops",      subtitulo: "Chuwi · Acer · Asus · Lenovo · Compaq · HP · Macbook", orden: 9  },
    { nombre: "Consolas",     subtitulo: "Sony PS5 · Nintendo Switch",                   orden: 10 },
    { nombre: "Tablets",      subtitulo: "Blackview · Redmi · Samsung · Apple",          orden: 11 },
    { nombre: "Otras Marcas", subtitulo: "Yezz · Logi · Panita",                        orden: 12 },
    { nombre: "Monitor",      subtitulo: "Gaming",                                       orden: 13 },
  ];

  // ── PRODUCTOS ────────────────────────────────────────────────────────
  const PRODUCTOS = [
    // iPhone
    { nombre: "iPhone 15 Pro Max 256GB eSIM",  marca: "iPhone",  precio: "$720,00",    imagen: "https://storage.comprasmartphone.com/smartphones/apple-iphone-15-pro-max.png",                                                                       orden: 1  },
    { nombre: "iPhone 16 Pro Max 512GB eSIM",  marca: "iPhone",  precio: "$1.020,00",  imagen: "https://xinsidec.com/wp-content/uploads/2024/10/iphone16promax-0.png",                                                                                orden: 2  },
    { nombre: "iPhone 17 Pro Max 256GB eSIM",  marca: "iPhone",  precio: "$1.520,00",  imagen: "https://www.mozillion.com/storage/product_model_images/1768471460_iPhone%2017%20Pro%20Max%20-%20Silver%20-%20Back.png",                               orden: 3  },
    { nombre: "iPhone 17 Pro Max 512GB eSIM",  marca: "iPhone",  precio: "$1.800,00",  imagen: "https://www.mozillion.com/storage/product_model_images/1768471460_iPhone%2017%20Pro%20Max%20-%20Silver%20-%20Back.png",                               orden: 4  },

    // Samsung
    { nombre: "Galaxy A07 4+128GB",            marca: "Samsung", precio: "$125,00",    imagen: "https://miamicenters.com/wp-content/uploads/2025/12/light.png",                                                                                       orden: 5  },
    { nombre: "Galaxy A16 4+128GB",            marca: "Samsung", precio: "$130,00",    imagen: "https://tiendaonline.movistar.com.ar/media/catalog/product/cache/1d01ed3f1ecf95fcf479279f9ae509ad/s/a/samsung-a16-lightgreen-frontback_1.png",        orden: 6  },
    { nombre: "Galaxy A17 4G 4+128GB",         marca: "Samsung", precio: "$165,00",    imagen: "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_166557740/fee_786_587_png",                                                                        orden: 7  },
    { nombre: "Galaxy A17 4G 6+128GB",         marca: "Samsung", precio: "$175,00",    imagen: "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_166557740/fee_786_587_png",                                                                        orden: 8  },
    { nombre: "Galaxy A17 4G 8+256GB",         marca: "Samsung", precio: "$220,00",    imagen: "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_166557740/fee_786_587_png",                                                                        orden: 9  },
    { nombre: "Galaxy A36 5G 8+256GB",         marca: "Samsung", precio: "$315,00",    imagen: "https://www.opinionesmalas.com/wp-content/uploads/2025/11/unnamed-file-2654.png",                                                                     orden: 10 },
    { nombre: "Galaxy A56 5G 12+256GB",        marca: "Samsung", precio: "$420,00",    imagen: "https://miamicenters.com/wp-content/uploads/2025/05/SAMSUNG-A56-LIGHT-GREY-600x600.png",                                                              orden: 11 },
    { nombre: "Galaxy A37 5G 8+256GB",         marca: "Samsung", precio: "$410,00",    imagen: "https://samtronixguyana.com/cdn/shop/files/SAMSUNGA375GSAMTRONIX_2_grande.png?v=1775216285",                                                           orden: 12 },
    { nombre: "Galaxy A57 5G 8+256GB",         marca: "Samsung", precio: "$440,00",    imagen: "https://www.facilitea.com/on/demandware.static/-/Sites-promocaixa-m-catalog/default/dwf2fdbf8a/telefonia/121-4009336/121-4009336_600x600_01.png",      orden: 13 },
    { nombre: "Galaxy A57 5G 12+512GB",        marca: "Samsung", precio: "$655,00",    imagen: "https://www.facilitea.com/on/demandware.static/-/Sites-promocaixa-m-catalog/default/dwf2fdbf8a/telefonia/121-4009336/121-4009336_600x600_01.png",      orden: 14 },
    { nombre: "Galaxy S26 12R+256GB",          marca: "Samsung", precio: "$830,00",    imagen: "https://www.macysdigital.com/wp-content/uploads/2026/02/Samsung-Galaxy-S26-Negro.png",                                                                orden: 15 },
    { nombre: "Galaxy S26 Ultra 12R+256GB",    marca: "Samsung", precio: "$1.240,00",  imagen: "https://shop.samsung.com/latin/pub/media/catalog/product/cache/a69170b4a4f0666a52473c2224ba9220/m/3/m3_set-cut-all_01_8.png",                         orden: 16 },
    { nombre: "Galaxy S26 Ultra 12R+512GB",    marca: "Samsung", precio: "$1.330,00",  imagen: "https://shop.samsung.com/latin/pub/media/catalog/product/cache/a69170b4a4f0666a52473c2224ba9220/m/3/m3_set-cut-all_01_8.png",                         orden: 17 },
    { nombre: "Galaxy S26 Ultra 16R+1TB",      marca: "Samsung", precio: "$1.580,00",  imagen: "https://shop.samsung.com/latin/pub/media/catalog/product/cache/a69170b4a4f0666a52473c2224ba9220/m/3/m3_set-cut-all_01_8.png",                         orden: 18 },

    // Infinix
    { nombre: "Infinix Smart 10 4+128GB",         marca: "Infinix", precio: "$100,00",  imagen: "https://mastronics.vtexassets.com/arquivos/ids/166179/Celular-Infinix-Smart-10-4G-Dorado-3.png?v=638876297440100000",  orden: 19 },
    { nombre: "Infinix Smart 20 4+128GB",         marca: "Infinix", precio: "",         imagen: "https://mastronics.vtexassets.com/arquivos/ids/167920/Celular-Infinix-Smart-20-4G-Negro-3.png?v=639088792583930000",   orden: 20 },
    { nombre: "Infinix Hot 60I 4+256GB",          marca: "Infinix", precio: "$140,00",  imagen: "https://mchris.ng/wp-content/uploads/2025/07/Infinix-Hot-60i.webp",                                                   orden: 21 },
    { nombre: "Infinix Hot 60I 8+256GB",          marca: "Infinix", precio: "$155,00",  imagen: "https://mchris.ng/wp-content/uploads/2025/07/Infinix-Hot-60i.webp",                                                   orden: 22 },
    { nombre: "Infinix Hot 60 Pro Plus 8+256GB",  marca: "Infinix", precio: "$230,00",  imagen: "https://global.pro.infinixmobility.com/media/wysiwyg/Base_HOT60PRO__60PRO__1.webp",                                   orden: 23 },
    { nombre: "Infinix Note 60 5G 8+256GB",       marca: "Infinix", precio: "$330,00",  imagen: "https://global.pro.infinixmobility.com/media/wysiwyg/x6878_note60pro_family-new.webp",                                orden: 24 },
    { nombre: "Infinix Note 60 Pro 8+256GB",      marca: "Infinix", precio: "$380,00",  imagen: "https://global.pro.infinixmobility.com/media/wysiwyg/x6878_note60pro_family-new.webp",                                orden: 25 },

    // Tecno
    { nombre: "Tecno Spark GO3 4R+128GB",      marca: "Tecno", precio: "$110,00",  imagen: "https://ddfndelma2gpn.cloudfront.net/color/3481/inkblack.webp",                                                                           orden: 26 },
    { nombre: "Tecno Spark 40C 8+256GB",       marca: "Tecno", precio: "$145,00",  imagen: "https://cdn.shopify.com/s/files/1/0652/8922/4380/files/All_colors_2_4383a171-a464-4bea-9ebf-62309776aec1.png?v=1760162960",              orden: 27 },
    { nombre: "Tecno Spark 50 4+256GB",        marca: "Tecno", precio: "$150,00",  imagen: "https://cdn.beebom.com/mobile/tecno-spark-50-front-back-2.png",                                                                           orden: 28 },
    { nombre: "Tecno Camon 50 Pro 8+256GB",    marca: "Tecno", precio: "$325,00",  imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPnTq9aq5wmNZydp2jMtvveiUZ6mL7dgIZmA&s",                                          orden: 29 },
    { nombre: "Tecno Camon 50 Ultra 8R+256GB", marca: "Tecno", precio: "$375,00",  imagen: "https://d13pvy8xd75yde.cloudfront.net/global/phones/909ff51007b9091eb154e6499654ff54.png",                                               orden: 30 },

    // Honor
    { nombre: "Honor Play 10A 3+64GB",     marca: "Honor", precio: "$95,00",   imagen: "", orden: 31 },
    { nombre: "Honor Play 10A 4+128GB",    marca: "Honor", precio: "$110,00",  imagen: "", orden: 32 },
    { nombre: "Honor X5C 4+128GB",         marca: "Honor", precio: "",         imagen: "", orden: 33 },
    { nombre: "Honor X5C Plus 6+256",      marca: "Honor", precio: "$130,00",  imagen: "", orden: 34 },
    { nombre: "Honor X7D 8+256GB",         marca: "Honor", precio: "$215,00",  imagen: "", orden: 35 },
    { nombre: "Honor X8D 8+256GB",         marca: "Honor", precio: "$315,00",  imagen: "", orden: 36 },
    { nombre: "Honor X8C 8+512GB",         marca: "Honor", precio: "",         imagen: "", orden: 37 },
    { nombre: "Honor Magic 7 Lite 8+256GB",marca: "Honor", precio: "",         imagen: "", orden: 38 },
    { nombre: "Honor Magic 8 Lite 8+256GB",marca: "Honor", precio: "$375,00",  imagen: "", orden: 39 },
    { nombre: "Honor Magic 8 Lite 8+512GB",marca: "Honor", precio: "$425,00",  imagen: "", orden: 40 },

    // Xiaomi
    { nombre: "Xiaomi Redmi 15C 4+128GB",          marca: "Xiaomi", precio: "$125,00",  imagen: "", orden: 41 },
    { nombre: "Xiaomi Redmi 15C 4+256GB",          marca: "Xiaomi", precio: "$129,00",  imagen: "", orden: 42 },
    { nombre: "Xiaomi Redmi 15C 8+256GB",          marca: "Xiaomi", precio: "$150,00",  imagen: "", orden: 43 },
    { nombre: "Xiaomi Redmi 15 6+128GB",           marca: "Xiaomi", precio: "$165,00",  imagen: "", orden: 44 },
    { nombre: "Xiaomi Redmi 15 8+256GB",           marca: "Xiaomi", precio: "",         imagen: "", orden: 45 },
    { nombre: "Xiaomi Note 15 4G 8+256GB",         marca: "Xiaomi", precio: "$210,00",  imagen: "", orden: 46 },
    { nombre: "Xiaomi Note 15 Pro 4G 8+256GB",     marca: "Xiaomi", precio: "$260,00",  imagen: "", orden: 47 },
    { nombre: "Xiaomi Note 15 Pro 5G 8+512GB",     marca: "Xiaomi", precio: "$340,00",  imagen: "", orden: 48 },
    { nombre: "Xiaomi Note 15 Pro Plus 5G 8+256GB",marca: "Xiaomi", precio: "$380,00",  imagen: "", orden: 49 },
    { nombre: "Xiaomi Note 15 Pro Plus 5G 12+512GB",marca:"Xiaomi", precio: "$420,00",  imagen: "", orden: 50 },

    // ZTE
    { nombre: "ZTE Blade V60 Smart 4+256GB", marca: "ZTE", precio: "$105,00",  imagen: "", orden: 51 },
    { nombre: "ZTE Blade V70 8+256GB",       marca: "ZTE", precio: "$145,00",  imagen: "", orden: 52 },

    // Vivo
    { nombre: "Vivo Y03 4+128GB",  marca: "Vivo", precio: "$120,00",  imagen: "", orden: 53 },
    { nombre: "Vivo Y19S 6+256GB", marca: "Vivo", precio: "$165,00",  imagen: "", orden: 54 },
    { nombre: "Vivo Y38 5G",       marca: "Vivo", precio: "$255,00",  imagen: "", orden: 55 },

    // Laptops
    { nombre: "Chuwi Corebook i3-10 14\" SSD 8R+256GB",  marca: "Laptops", precio: "$340,00",  imagen: "", orden: 56 },
    { nombre: "Acer Etbook i3-10 14\" SSD 8R+256GB",     marca: "Laptops", precio: "$370,00",  imagen: "", orden: 57 },
    { nombre: "Asus Vivobook Ryzen 7 7730U 16+612GB",    marca: "Laptops", precio: "$610,00",  imagen: "", orden: 58 },
    { nombre: "Lenovo Ideapad 3 N100 4+128GB",           marca: "Laptops", precio: "$260,00",  imagen: "", orden: 59 },
    { nombre: "Compaq Q-Book i5-1235U SSD 8+256GB",      marca: "Laptops", precio: "$520,00",  imagen: "", orden: 60 },
    { nombre: "HP Notebook 15 Ryzen 5 7730U 8+256GB",    marca: "Laptops", precio: "$550,00",  imagen: "", orden: 61 },
    { nombre: "HP 255r G10 Ryzen 7 7735U 16+512GB",      marca: "Laptops", precio: "$620,00",  imagen: "", orden: 62 },
    { nombre: "Acer Aspire GO 15 i3-N355 16GB+512GB",    marca: "Laptops", precio: "$480,00",  imagen: "", orden: 63 },
    { nombre: "Macbook Neo A16 13\" 6 Core 8/256GB",     marca: "Laptops", precio: "$800,00",  imagen: "", orden: 64 },

    // Consolas
    { nombre: "Sony PS5 Slim Fortnite 1TB",  marca: "Consolas", precio: "$630,00",  imagen: "", orden: 65 },
    { nombre: "Nintendo Switch 2 Mario Kart",marca: "Consolas", precio: "$600,00",  imagen: "", orden: 66 },
    { nombre: "Control Original PS5",        marca: "Consolas", precio: "$100,00",  imagen: "", orden: 67 },
    { nombre: "Sony PS5 Slim Classic 1TB",   marca: "Consolas", precio: "",         imagen: "", orden: 68 },

    // Tablets
    { nombre: "Dialn S10 4+64GB",           marca: "Tablets", precio: "$90,00",   imagen: "", orden: 69 },
    { nombre: "Blackview Tab 50 Kids 3R+64GB",marca:"Tablets", precio: "$90,00",   imagen: "", orden: 70 },
    { nombre: "Redmi Pad SE 8.7 4+128GB",   marca: "Tablets", precio: "$130,00",  imagen: "", orden: 71 },
    { nombre: "Redmi Pad 2 4+128GB",        marca: "Tablets", precio: "$175,00",  imagen: "", orden: 72 },
    { nombre: "Redmi Pad 2 8+256GB",        marca: "Tablets", precio: "$210,00",  imagen: "", orden: 73 },
    { nombre: "Samsung Tab S10 8+128GB",    marca: "Tablets", precio: "$410,00",  imagen: "", orden: 74 },
    { nombre: "Apple iPad A16 128GB",       marca: "Tablets", precio: "$420,00",  imagen: "", orden: 75 },

    // Otras Marcas
    { nombre: "Yezz Max 3 2+32GB", marca: "Otras Marcas", precio: "$60,00",  imagen: "", orden: 76 },
    { nombre: "Logi B10L 4G",      marca: "Otras Marcas", precio: "",        imagen: "", orden: 77 },
    { nombre: "Panita Pro 4G",     marca: "Otras Marcas", precio: "$35,00",  imagen: "", orden: 78 },

    // Monitor
    { nombre: "Acer Gaming 180Hz 23.8\"", marca: "Monitor", precio: "$150,00", imagen: "", orden: 79 },
  ];

  console.log("🚀 Iniciando carga masiva...");

  // Cargar marcas
  console.log("📦 Cargando marcas...");
  for (const m of MARCAS) {
    await addDoc(collection(db, "marcas"), { ...m, createdAt: serverTimestamp() });
    console.log(`  ✅ Marca: ${m.nombre}`);
  }

  // Cargar productos
  console.log("📱 Cargando productos...");
  for (const p of PRODUCTOS) {
    await addDoc(collection(db, "productos"), { ...p, createdAt: serverTimestamp() });
    console.log(`  ✅ Producto: ${p.nombre}`);
  }

  console.log("🎉 ¡Carga completa! Recarga la página del catálogo.");
})();
