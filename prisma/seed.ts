import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // 1. Bersihkan data lama
  await prisma.transaction.deleteMany();
  await prisma.alert.deleteMany();

  try {
    // @ts-ignore
    if (prisma.salesForecast) await prisma.salesForecast.deleteMany();
  } catch (e) {
    // Abaikan
  }

  await prisma.product.deleteMany();

  // 2. Buat Data Produk Sesuai Permintaan
  const prodElektronik = await prisma.product.create({
    data: {
      name: 'Kamera Mirrorless',
      sku: 'ELEC-001',
      stock: 15,
      category: 'Elektronik',
      price: 150000,
    },
  });

  const prodKeras = await prisma.product.create({
    data: {
      name: 'SSD 1TB NVMe',
      sku: 'HARD-002',
      stock: 8,
      category: 'Perangkat Keras',
      price: 175000,
    },
  });

  // 3. Buat Data Transaksi Dummy (Tren Naik Stabil)
  console.log('📦 Menyuntikkan riwayat data transaksi...');
  await prisma.transaction.createMany({
    data: [
      // --- JANUARI (Total: Rp 300.000) ---
      {
        invoiceDate: new Date('2026-01-15T10:00:00Z'),
        customerId: 'CUST-001',
        quantity: 2,
        unitPrice: 150000,
        totalSales: 300000,
        status: 'Completed',
        productId: prodElektronik.id,
      },
      // --- FEBRUARI (Total: Rp 450.000) ---
      {
        invoiceDate: new Date('2026-02-10T14:30:00Z'),
        customerId: 'CUST-002',
        quantity: 3,
        unitPrice: 150000,
        totalSales: 450000,
        status: 'Completed',
        productId: prodElektronik.id,
      },
      // --- MARET (Total: Rp 600.000) ---
      {
        invoiceDate: new Date('2026-03-20T09:15:00Z'),
        customerId: 'CUST-003',
        quantity: 4,
        unitPrice: 150000,
        totalSales: 600000,
        status: 'Completed',
        productId: prodElektronik.id,
      },
      // --- APRIL (Total: Rp 750.000) ---
      {
        invoiceDate: new Date('2026-04-05T11:00:00Z'),
        customerId: 'CUST-004',
        quantity: 5,
        unitPrice: 150000,
        totalSales: 750000,
        status: 'Completed',
        productId: prodElektronik.id,
      },
      // --- MEI (Total: Rp 900.000) ---
      {
        invoiceDate: new Date('2026-05-12T13:45:00Z'),
        customerId: 'CUST-005',
        quantity: 6,
        unitPrice: 150000,
        totalSales: 900000,
        status: 'Completed',
        productId: prodElektronik.id,
      },
      // --- JUNI (Total: Rp 1.100.000) ---
      // Transaksi 1: 5 Kamera Mirrorless (Rp 750.000)
      {
        invoiceDate: new Date('2026-06-08T16:20:00Z'),
        customerId: 'CUST-006',
        quantity: 5,
        unitPrice: 150000,
        totalSales: 750000,
        status: 'Completed',
        productId: prodElektronik.id,
      },
      // Transaksi 2: 2 SSD 1TB NVMe (Rp 350.000)
      {
        invoiceDate: new Date('2026-06-11T09:30:00Z'),
        customerId: 'CUST-007',
        quantity: 2,
        unitPrice: 175000,
        totalSales: 350000,
        status: 'Completed',
        productId: prodKeras.id,
      },
    ],
  });

  // 4. Buat Data Peringatan
  await prisma.alert.create({
    data: {
      title: 'Peringatan Stok Menipis',
      status: 'ACTIVE',
      type: 'INVENTORY_ALERT',
      description:
        'Stok SSD 1TB NVMe saat ini tersisa 8 unit. Segera lakukan restock ulang.',
      severity: 'WARNING',
    },
  });

  console.log(
    '✅ Seeding selesai! Database kini memiliki data yang dioptimalkan untuk AI.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
