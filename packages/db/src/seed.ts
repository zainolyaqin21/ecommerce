import { db, poolConnection, categories, products, productVariants, users } from "./index";
import { eq } from "drizzle-orm";

interface CategorySeedData {
  name: string;
  slug: string;
  productNames: string[];
}

const seedCategories: CategorySeedData[] = [
  {
    name: "Elektronik & Gadget",
    slug: "elektronik-gadget",
    productNames: [
      "Smartphone Pro Max 5G",
      "Laptop Ultra Slim 14 Inch",
      "Wireless Noise Cancelling Headphone",
      "Smartwatch Fitness Tracker",
      "Tablet Digital Drawing 11 Inch",
      "Power Bank Fast Charging 20000mAh",
      "Mechanical Gaming Keyboard RGB",
      "Wireless Ergonomic Mouse",
      "Bluetooth Portable Speaker",
      "True Wireless Stereo Earbuds",
    ],
  },
  {
    name: "Pakaian Pria",
    slug: "pakaian-pria",
    productNames: [
      "Kemeja Oxford Lengan Panjang",
      "Kaos Polos Cotton Combed 30s",
      "Celana Chino Slim Fit Pria",
      "Jaket Bomber Casual Streetwear",
      "Celana Jeans Denim Straight Leg",
      "Hoodie Zipper Fleece Tebal",
      "Polo Shirt Basic Pique",
      "Celana Pendek Chino Santai",
      "Sweater Crewneck Knit Pria",
      "Jas Blazer Formal Modern",
    ],
  },
  {
    name: "Pakaian Wanita",
    slug: "pakaian-wanita",
    productNames: [
      "Blouse Floral Kerah V-Neck",
      "Dress Midi Casual Elegan",
      "Cardigan Rajut Oversized Wanita",
      "Celana Kulot Highwaist Linen",
      "Rok Plisket Panjang Premium",
      "Tunik Muslimah Motif Elegan",
      "Kemeja Rayon Viscose Lengan Panjang",
      "Outer Blazer Casual Wanita",
      "Kaos Oversize Tumblr Tee",
      "Jumpsuit Linen Relaxed Fit",
    ],
  },
  {
    name: "Sepatu & Sandal",
    slug: "sepatu-sandal",
    productNames: [
      "Sneakers Casual Retro Low Top",
      "Sepatu Lari Running Breathable",
      "Sepatu Pantofel Kulit Formal",
      "Sandal Slide Slide-On Slip",
      "Sepatu Slip On Kanvas Ringan",
      "Boots Kulit Casual Outdoor",
      "Sepatu Basket High Ankle Support",
      "Sandal Gunung Adventure Strap",
      "Flat Shoes Balet Wanita Casual",
      "Heels Pump Elegan 5cm",
    ],
  },
  {
    name: "Tas & Aksesoris",
    slug: "tas-aksesoris",
    productNames: [
      "Backpack Laptop Anti Air 20L",
      "Tas Selempang Sling Bag Minimalis",
      "Tote Bag Canvas Aesthetic",
      "Dompet Kulit Pria Lipat Dua",
      "Kacamata Hitam Polarized UV400",
      "Jam Tangan Quartz Classic Analog",
      "Ikat Pinggang Kulit Sapi Asli",
      "Topi Baseball Bordir Casual",
      "Tas Ransel Travel Daypack",
      "Clutch Bag Handbag Pria Wanita",
    ],
  },
  {
    name: "Kecantikan & Perawatan",
    slug: "kecantikan-perawatan",
    productNames: [
      "Gentle Face Cleanser Low pH",
      "Hydrating Toner Hyaluronic Acid",
      "Brightening Serum Vitamin C 10%",
      "Moisturizer Gel Ceramide Barrier",
      "Sunscreen SPF 50+ PA++++ Ringan",
      "Clay Mask Pori & Minyak Berlebih",
      "Body Lotion Fragrance Pemutih",
      "Lip Tint Velvet Matte Tahan Lama",
      "Micellar Water Deep Cleansing",
      "Shampoo Anti Ketombe & Rontok",
    ],
  },
  {
    name: "Kesehatan & Olahraga",
    slug: "kesehatan-olahraga",
    productNames: [
      "Matras Yoga Anti Slip 8mm",
      "Dumbbell Karet Hexagonal 5kg",
      "Resistance Bands Set Latihan Rumah",
      "Botol Minum Motivasi 2 Liter",
      "Tali Skipping Jump Rope Bearing",
      "Foam Roller Pijat Otot Recovery",
      "Tas Gym Duffel Kompartemen Sepatu",
      "Celana Legging Olahraga Kompresi",
      "Jersey Dry Fit Olahraga Unisex",
      "Sarung Tangan Fitness Gym Grip",
    ],
  },
  {
    name: "Perlengkapan Rumah & Dapur",
    slug: "perlengkapan-rumah-dapur",
    productNames: [
      "Wajan Frypan Granit Anti Lengket",
      "Panci Steamer Kukusan Stainless",
      "Pisau Dapur Set 6 in 1 Tajam",
      "Kotak Makan Kaca Microwave Safe",
      "Lampu Meja LED Belajar Fleksibel",
      "Sprei Katun Jepang Single Size",
      "Bantal Tidur Memory Foam Ergonomis",
      "Rak Sepatu Minimalis Susun 5",
      "Diffuser Aromaterapi Ultrasonik",
      "Teko Listrik Pemanas Air 1.8L",
    ],
  },
  {
    name: "Buku & Alat Tulis",
    slug: "buku-alat-tulis",
    productNames: [
      "Buku Catatan Dotted Hardcover A5",
      "Pulpen Gel Ballpoint 0.5mm Pack",
      "Stabilo Highlighter Warna Pastel",
      "Tempat Pensil Organizer Meja",
      "Buku Agenda Planner Mingguan",
      "Sticky Notes Memo Pad Morandi",
      "Gunting Kertas Stainless Tajam",
      "Correction Tape Pita Penghapus",
      "Sketchbook Sketsa Kertas Tebal",
      "Kalkulator Ilmiah Standard Fungsi",
    ],
  },
  {
    name: "Makanan & Minuman",
    slug: "makanan-minuman",
    productNames: [
      "Biji Kopi Arabika Single Origin 250g",
      "Teh Hijau Organik Premium 100g",
      "Madu Murni Hutan Asli 500g",
      "Granola Cereal Buah Kering Sehat",
      "Keripik Kentang Renyah Sea Salt",
      "Cokelat Hitam Dark Chocolate 70%",
      "Almond Panggang Roasted Roasted Nut",
      "Matcha Powder Murni Tanpa Gula",
      "Biskuit Gandum Serat Tinggi",
      "Sirup Gula Aren Organik 1L",
    ],
  },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seed() {
  console.log("🌱 Memulai proses seeding database...");

  try {
    // 0. Seed Akun Admin Default
    const adminEmail = "budi@gmail.com";
    const [existingAdmin] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin) {
      console.log(`ℹ️ Admin user "${adminEmail}" sudah ada (ID: ${existingAdmin.id})`);
    } else {
      const hashedPassword = await Bun.password.hash("123456");
      const [insertedAdmin] = await db.insert(users).values({
        name: "budi",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✅ Admin user dibuat: "budi" (${adminEmail}) (ID: ${insertedAdmin.insertId})`);
    }

    let totalCategoriesInserted = 0;
    let totalProductsInserted = 0;

    for (const catData of seedCategories) {
      // 1. Cek atau Buat Kategori
      let categoryId: number;
      const [existingCat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, catData.slug))
        .limit(1);

      if (existingCat) {
        categoryId = existingCat.id;
        console.log(`ℹ️ Kategori "${catData.name}" sudah ada (ID: ${categoryId})`);
      } else {
        const [insertedCat] = await db.insert(categories).values({
          name: catData.name,
          slug: catData.slug,
        });
        categoryId = Number(insertedCat.insertId);
        totalCategoriesInserted++;
        console.log(`✅ Kategori dibuat: "${catData.name}" (ID: ${categoryId})`);
      }

      // 2. Buat 10 Produk untuk tiap kategori
      for (let i = 0; i < catData.productNames.length; i++) {
        const prodName = catData.productNames[i];
        const prodSlug = generateSlug(prodName);
        const imageUrl = `https://picsum.photos/seed/${prodSlug}/400/400`;

        // Range harga antara 25.000 s/d 1.500.000
        const basePrice = Math.floor(Math.random() * 30 + 1) * 25000 + 50000;
        const stockCount = Math.floor(Math.random() * 80) + 15;

        // Cek ketersediaan produk
        const [existingProd] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, prodSlug))
          .limit(1);

        if (existingProd) {
          console.log(`  - Produk "${prodName}" sudah ada (ID: ${existingProd.id})`);
        } else {
          const [insertedProd] = await db.insert(products).values({
            categoryId,
            name: prodName,
            slug: prodSlug,
            description: `${prodName} dengan kualitas terbaik dan material premium. Cocok untuk kebutuhan sehari-hari maupun koleksi Anda. Bergaransi resmi dan pengiriman aman.`,
            price: basePrice,
            stock: stockCount,
            imageUrl,
          });

          const productId = Number(insertedProd.insertId);
          totalProductsInserted++;

          // Buat 2 varian opsional untuk tiap produk agar fitur varian langsung terisi
          const variantTypes = [
            { name: "Standard / Reguler", skuSuffix: "STD", priceAdj: 0 },
            { name: "Premium / XL", skuSuffix: "PRM", priceAdj: 25000 },
          ];

          for (const vt of variantTypes) {
            const vSku = `${prodSlug.substring(0, 10).toUpperCase()}-${vt.skuSuffix}-${productId}`;
            await db.insert(productVariants).values({
              productId,
              sku: vSku,
              name: `${prodName} - ${vt.name}`,
              price: basePrice + vt.priceAdj,
              stock: Math.floor(stockCount / 2),
              imageUrl,
              attributes: { tipe: vt.name },
            });
          }

          console.log(`  ✅ Produk ditambahkan: "${prodName}" (Rp ${basePrice.toLocaleString("id-ID")})`);
        }
      }
    }

    console.log("\n=================================");
    console.log(`🎉 Seeding selesai dengan sukses!`);
    console.log(`📦 Kategori baru ditambahkan: ${totalCategoriesInserted}`);
    console.log(`🛍️ Produk baru ditambahkan: ${totalProductsInserted}`);
    console.log("=================================\n");
  } catch (error) {
    console.error("❌ Gagal saat melakukan seeding:", error);
    process.exit(1);
  } finally {
    await poolConnection.end();
  }
}

seed();

