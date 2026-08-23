import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding WHPS Central Data Platform with Real Assets...");

  // 1. Company
  await prisma.company.upsert({
    where: { id: "whp-corp" },
    update: {},
    create: {
      id: "whp-corp",
      legalName: "Waman Hari Pethe Jewellers Pvt Ltd",
      tradeName: "WHP Jewellers",
      gstNumber: "27AAACW1234F1Z5",
      panNumber: "AAACW1234F",
      logoUrl: "/logo.png",
      corporateEmail: "corporate@whpjewellers.com",
      corporatePhone: "+91 22 2430 1234",
      registeredAddress: JSON.stringify({
        line1: "WHP House, Dadar West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400028"
      })
    }
  });

  // 2. Roles
  const adminRole = await prisma.role.upsert({
    where: { slug: "super-admin" },
    update: {},
    create: {
      name: "Super Admin",
      slug: "super-admin",
      description: "Full access to all 16 modules across all branches",
      scope: "GLOBAL",
      isSystem: true
    }
  });

  // 3. Admin User
  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@whpjewellers.com" },
    update: {},
    create: {
      name: "Rajendra Pethe",
      email: "admin@whpjewellers.com",
      phone: "+919820011223",
      avatarUrl: "/assets/users/director.jpg",
      passwordHash,
      type: "INTERNAL",
      status: "ACTIVE"
    }
  });

  await prisma.userRole.upsert({
    where: { id: "admin-role-assignment" },
    update: {},
    create: {
      id: "admin-role-assignment",
      userId: adminUser.id,
      roleId: adminRole.id,
      grantedBy: "SYSTEM"
    }
  });

  // 4. Branches with Real Showroom Photos
  const branchData = [
    { code: "WHP-MUM-01", name: "Dadar Flagship", city: "Mumbai", state: "Maharashtra", phone: "+91 22 2430 1111", target: 50000000 },
    { code: "WHP-MUM-02", name: "Thane Showroom", city: "Thane", state: "Maharashtra", phone: "+91 22 2540 2222", target: 35000000 },
    { code: "WHP-MUM-03", name: "Vashi Sector 17", city: "Navi Mumbai", state: "Maharashtra", phone: "+91 22 2789 3333", target: 30000000 },
    { code: "WHP-PUN-01", name: "Laxmi Road Pune", city: "Pune", state: "Maharashtra", phone: "+91 20 2445 4444", target: 45000000 },
    { code: "WHP-PUN-02", name: "Kothrud Depot", city: "Pune", state: "Maharashtra", phone: "+91 20 2538 5555", target: 25000000 },
    { code: "WHP-NSK-01", name: "College Road Nashik", city: "Nashik", state: "Maharashtra", phone: "+91 253 231 6666", target: 20000000 },
    { code: "WHP-NAG-01", name: "Dharampeth Nagpur", city: "Nagpur", state: "Maharashtra", phone: "+91 712 252 7777", target: 25000000 },
    { code: "WHP-KOL-01", name: "Rajarampuri Kolhapur", city: "Kolhapur", state: "Maharashtra", phone: "+91 231 252 8888", target: 18000000 },
    { code: "WHP-AUR-01", name: "Samarth Nagar Chhatrapati Sambhajinagar", city: "Chhatrapati Sambhajinagar", state: "Maharashtra", phone: "+91 240 234 9999", target: 15000000 },
    { code: "WHP-SOL-01", name: "Navi Peth Solapur", city: "Solapur", state: "Maharashtra", phone: "+91 217 232 1010", target: 12000000 },
    { code: "WHP-RAT-01", name: "Maruti Mandir Ratnagiri", city: "Ratnagiri", state: "Maharashtra", phone: "+91 2352 222 111", target: 10000000 },
    { code: "WHP-GOA-01", name: "Panaji MG Road", city: "Panaji", state: "Goa", phone: "+91 832 222 3333", target: 15000000 }
  ];

  const branches = [];
  for (const b of branchData) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: {},
      create: {
        code: b.code,
        name: b.name,
        city: b.city,
        state: b.state,
        phone: b.phone,
        targetMonthlyRevenue: b.target,
        type: "CORPORATE",
        status: "ACTIVE"
      }
    });
    branches.push(branch);
  }

  // 5. Strongroom Vaults
  const mainBranch = branches[0];
  const mainVault = await prisma.inventoryLocation.upsert({
    where: { branchId_code: { branchId: mainBranch.id, code: "VAULT-01" } },
    update: {},
    create: {
      branchId: mainBranch.id,
      name: "Main Strongroom Vault",
      code: "VAULT-01",
      type: "VAULT",
      capacity: 5000
    }
  });

  const mainShowcase = await prisma.inventoryLocation.upsert({
    where: { branchId_code: { branchId: mainBranch.id, code: "SHOWCASE-A" } },
    update: {},
    create: {
      branchId: mainBranch.id,
      name: "Bridal Suite Showcase A",
      code: "SHOWCASE-A",
      type: "SHOWCASE",
      capacity: 200
    }
  });

  // 6. Categories with Real Category Cover Images
  const goldCategory = await prisma.category.upsert({
    where: { slug: "gold-jewellery" },
    update: { iconUrl: "/assets/categories/gold_jewellery.jpg" },
    create: {
      name: "Gold Jewellery",
      slug: "gold-jewellery",
      iconUrl: "/assets/categories/gold_jewellery.jpg",
      displayOrder: 1
    }
  });

  const diamondCategory = await prisma.category.upsert({
    where: { slug: "diamond-jewellery" },
    update: { iconUrl: "/assets/categories/diamond_jewellery.jpg" },
    create: {
      name: "Diamond Jewellery",
      slug: "diamond-jewellery",
      iconUrl: "/assets/categories/diamond_jewellery.jpg",
      displayOrder: 2
    }
  });

  const bridalCategory = await prisma.category.upsert({
    where: { slug: "bridal-jewellery" },
    update: { iconUrl: "/assets/categories/bridal_jewellery.jpg" },
    create: {
      name: "Bridal Jewellery",
      slug: "bridal-jewellery",
      iconUrl: "/assets/categories/bridal_jewellery.jpg",
      displayOrder: 3
    }
  });

  const mangalsutraCategory = await prisma.category.upsert({
    where: { slug: "mangalsutra" },
    update: { iconUrl: "/assets/categories/mangalsutra.jpg" },
    create: {
      name: "Mangalsutra",
      slug: "mangalsutra",
      iconUrl: "/assets/categories/mangalsutra.jpg",
      displayOrder: 4
    }
  });

  const bridalCollection = await prisma.collection.upsert({
    where: { id: "heritage-bridal-2026" },
    update: { coverImageUrl: "/assets/collections/coll_bridal_heritage.jpg" },
    create: {
      id: "heritage-bridal-2026",
      name: "Heritage Maharashtrian Bridal",
      theme: "Traditional Peshwai Gold",
      coverImageUrl: "/assets/collections/coll_bridal_heritage.jpg"
    }
  });

  // 7. Products with Real Product Images
  const productsData = [
    {
      sku: "WHP-GLD-NK-001",
      name: "22KT Gold Kolhapuri Saaj Necklace",
      catId: goldCategory.id,
      metal: "GOLD",
      purity: "22KT",
      minWt: 35.0,
      maxWt: 60.0,
      desc: "Authentic 21-pan Kolhapuri Saaj crafted in 22KT certified gold with traditional hand-carving.",
      img: "/assets/products/kolhapuri_saaj.jpg"
    },
    {
      sku: "WHP-GLD-NK-002",
      name: "22KT Traditional Peshwai Thushi",
      catId: goldCategory.id,
      metal: "GOLD",
      purity: "22KT",
      minWt: 18.0,
      maxWt: 30.0,
      desc: "Classic Maharashtrian gold thushi with high-polish gokhru beads and adjustable dori.",
      img: "/assets/products/bridal_necklace.jpg"
    },
    {
      sku: "WHP-GLD-BG-001",
      name: "22KT Patlya & Toda Bangle Set",
      catId: goldCategory.id,
      metal: "GOLD",
      purity: "22KT",
      minWt: 40.0,
      maxWt: 80.0,
      desc: "Heavy traditional bridal bangles featuring embossed floral motifs.",
      img: "/assets/products/gold_bangles.jpg"
    },
    {
      sku: "WHP-DMD-RN-001",
      name: "Solitaire Diamond Engagement Ring 1.2ct",
      catId: diamondCategory.id,
      metal: "PLATINUM",
      purity: "950",
      minWt: 4.5,
      maxWt: 6.0,
      desc: "VVS1 Clarity, E-Color IGI Certified Solitaire in platinum 4-prong setting.",
      img: "/assets/products/solitaire_diamond_ring.jpg"
    },
    {
      sku: "WHP-MNG-001",
      name: "22KT Royal Double Vati Mangalsutra",
      catId: mangalsutraCategory.id,
      metal: "GOLD",
      purity: "22KT",
      minWt: 22.0,
      maxWt: 45.0,
      desc: "Traditional black bead chain with dual carved gold vatis and emerald drop accents.",
      img: "/assets/products/mangalsutra.jpg"
    },
    {
      sku: "WHP-[#NTH]-001",
      name: "22KT Brahmani Pearl Nath",
      catId: bridalCategory.id,
      metal: "GOLD",
      purity: "22KT",
      minWt: 3.5,
      maxWt: 8.0,
      desc: "Heritage Maharashtrian nose ring set with Basra pearls and uncut ruby.",
      img: "/assets/products/brahmani_nath.jpg"
    }
  ];

  const products = [];
  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: p.catId,
        collectionId: bridalCollection.id,
        metalType: p.metal,
        purity: p.purity,
        makingChargeType: "PERCENT_ON_WEIGHT",
        makingChargeValue: 12.5,
        minWeightGm: p.minWt,
        maxWeightGm: p.maxWt,
        description: p.desc,
        status: "ACTIVE"
      }
    });

    // Create Product Media entry with real image
    await prisma.productMedia.upsert({
      where: { id: `media-${p.sku}` },
      update: { url: p.img },
      create: {
        id: `media-${p.sku}`,
        productId: prod.id,
        url: p.img,
        type: "IMAGE",
        isPrimary: true
      }
    });

    products.push(prod);
  }

  // 8. Individual HUID Items
  await prisma.jewelleryItem.upsert({
    where: { itemCode: "WHP-ITEM-8801" },
    update: {},
    create: {
      itemCode: "WHP-ITEM-8801",
      huid: "HUID-MH-984321",
      productId: products[0].id,
      metalType: "GOLD",
      purity: "22KT",
      grossWeightGm: 45.250,
      netWeightGm: 45.250,
      makingCharge: 38500,
      tagPrice: 348000,
      costPrice: 295000,
      status: "IN_STOCK",
      branchId: mainBranch.id,
      locationId: mainShowcase.id,
      isHallmarked: true,
      isCertified: true
    }
  });

  await prisma.jewelleryItem.upsert({
    where: { itemCode: "WHP-ITEM-8802" },
    update: {},
    create: {
      itemCode: "WHP-ITEM-8802",
      huid: "HUID-MH-984322",
      productId: products[1].id,
      metalType: "GOLD",
      purity: "22KT",
      grossWeightGm: 24.180,
      netWeightGm: 24.180,
      makingCharge: 18500,
      tagPrice: 184000,
      costPrice: 155000,
      status: "IN_STOCK",
      branchId: mainBranch.id,
      locationId: mainVault.id,
      isHallmarked: true,
      isCertified: true
    }
  });

  // 9. HR Depts & Jobs
  const salesDept = await prisma.department.upsert({
    where: { id: "dept-sales" },
    update: {},
    create: { id: "dept-sales", name: "Retail Sales & CRM" }
  });

  const managerDesig = await prisma.designation.upsert({
    where: { id: "desig-store-mgr" },
    update: {},
    create: { id: "desig-store-mgr", name: "Store Manager", departmentId: salesDept.id, grade: "M2", minSalary: 60000, maxSalary: 120000 }
  });

  await prisma.job.upsert({
    where: { id: "job-sales-exec-pune" },
    update: {},
    create: {
      id: "job-sales-exec-pune",
      title: "Senior Jewellery Sales Consultant",
      branchId: branches[3].id,
      departmentId: salesDept.id,
      designationId: managerDesig.id,
      type: "FULL_TIME",
      description: "Looking for an experienced luxury gold & diamond sales consultant for our Laxmi Road Pune showroom.",
      requirements: "Minimum 3 years experience in gold & diamond sales, fluent in Marathi, Hindi & English.",
      minExperienceYears: 3,
      vacancies: 4,
      salaryMin: 35000,
      salaryMax: 55000,
      locationCity: "Pune",
      status: "PUBLISHED",
      isPublic: true
    }
  });

  // 10. Gold Rates
  await prisma.goldRate.upsert({
    where: { date: new Date(new Date().setHours(0,0,0,0)) },
    update: {},
    create: {
      date: new Date(new Date().setHours(0,0,0,0)),
      rate22kt: 6850.0,
      rate24kt: 7470.0,
      rate18kt: 5600.0,
      source: "IBJA Mumbai Spot"
    }
  });

  console.log("✅ Seed script updated with real WHPS media assets!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });