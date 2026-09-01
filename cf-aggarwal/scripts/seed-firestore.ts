import slugify from "slugify";
import { adminDb } from "../../website-aggarwal/src/lib/firebase/admin";
import { COLLECTIONS, SETTINGS_DOCS } from "../../website-aggarwal/src/lib/firebase/constants";

function slug(text: string) {
  return slugify(text, { lower: true, strict: true });
}

const now = () => new Date();

type MenuItem = { name: string; price?: number; desc?: string; featured?: boolean };

const categories: { name: string; desc?: string; items: MenuItem[] }[] = [
  {
    name: "Breakfast Menu",
    items: [
      { name: "Chole Bhature", price: 80, desc: "Fluffy bhature served with spicy Punjabi chickpea curry.", featured: true },
      { name: "Puri Sabji (Sunday)", price: 100, desc: "Crispy puris with traditional potato curry, Sundays only." },
      { name: "Amritsari Naan with Chana", price: 120, desc: "Stuffed naan paired with flavorful Punjabi chana masala." },
      { name: "Aloo Parantha with Dahi", price: 100, desc: "Buttery potato-stuffed parantha served with fresh curd." },
      { name: "Onion Parantha with Dahi", price: 100, desc: "Crispy onion-stuffed parantha served with chilled curd." },
      { name: "Mix Parantha with Dahi", price: 100, desc: "Assorted vegetable stuffed parantha with fresh curd." },
      { name: "Paneer Parantha with Dahi", price: 120, desc: "Soft paneer-stuffed parantha served with creamy curd." },
      { name: "Cheese Naan with Gravy", price: 170, desc: "Cheesy naan served with rich, flavorful curry gravy." },
    ],
  },
  {
    name: "Street Food",
    items: [
      { name: "Gol Gappe (6 pcs)", price: 50 },
      { name: "Bharva Gol Gappe (Suji/Atta)", price: 80 },
      { name: "Papri Chaat", price: 80 },
      { name: "Dahi Bhalla Chaat", price: 80 },
      { name: "Dahi Bhalla Papri Chaat", price: 90 },
      { name: "Raj Kachori", price: 120 },
      { name: "Aloo Tikki (Desi Ghee)", price: 100 },
      { name: "Tikki Chole", price: 120 },
      { name: "Tikki Chaat", price: 120 },
      { name: "Pav Bhaji", price: 120, featured: true },
      { name: "Extra Pav", price: 20 },
    ],
  },
  {
    name: "South Indian",
    items: [
      { name: "Plain Dosa", price: 110 },
      { name: "Masala Dosa", price: 150, featured: true },
      { name: "Paneer Dosa", price: 180 },
      { name: "Rava Plain Dosa", price: 150 },
      { name: "Rava Masala Dosa", price: 170 },
      { name: "Onion Uttapam", price: 150 },
      { name: "Veg Uttapam", price: 160 },
      { name: "Masala Uttapam", price: 180 },
    ],
  },
  {
    name: "Chinese",
    items: [
      { name: "Veg Manchurian", price: 240 },
      { name: "Cheese Chilli", price: 290 },
      { name: "Mushroom Chilli", price: 290 },
      { name: "Spring Roll", price: 180 },
      { name: "Cigar Roll (6 pcs)", price: 220 },
      { name: "Honey Chilli Potato", price: 240 },
      { name: "Veg Noodle", price: 190 },
      { name: "Cheese Noodle", price: 230 },
      { name: "Hakka Noodle", price: 220 },
      { name: "Chilli Garlic Noodle", price: 230 },
      { name: "Veg Fried Rice", price: 190 },
      { name: "Paneer Fried Rice", price: 230 },
    ],
  },
  {
    name: "Momo",
    items: [
      { name: "Veg Momo (Steam 8 pcs)", price: 150 },
      { name: "Paneer Momo (Steam 8 pcs)", price: 190 },
    ],
  },
  {
    name: "Chef Special",
    items: [{ name: "Chinese Sizzler", price: 499 }],
  },
  {
    name: "Soup",
    items: [
      { name: "Veg Soup", price: 120 },
      { name: "Tomato Soup", price: 140 },
      { name: "Manchow Soup", price: 140 },
      { name: "Sweet Corn Soup", price: 140 },
      { name: "Hot N Sour Soup", price: 110 },
    ],
  },
  {
    name: "Sandwiches",
    items: [
      { name: "Veg Grilled Sandwich", price: 150 },
      { name: "Cheese Grilled Sandwich", price: 180 },
      { name: "Paneer Tikka Sandwich", price: 220 },
      { name: "Corn Grilled Sandwich", price: 160 },
      { name: "Club Sandwich", price: 130 },
    ],
  },
  {
    name: "Continental",
    items: [
      { name: "Veg Burger", price: 80 },
      { name: "Veg Cheese Burger", price: 110 },
      { name: "Crispy Corn", price: 200 },
      { name: "French Fries", price: 130 },
      { name: "Peri Peri Fries", price: 150 },
      { name: "Cheese Finger", price: 200 },
    ],
  },
  {
    name: "Pizza",
    items: [
      { name: "Margherita Pizza", price: 180 },
      { name: "Onion Capsicum Pizza", price: 200 },
      { name: "Paneer Tikka Pizza", price: 300 },
      { name: "Corn Pizza", price: 190 },
      { name: "Farm House Pizza", price: 280 },
      { name: "Spicy Paneer Pizza", price: 280 },
      { name: "Mushroom Pizza", price: 290 },
    ],
  },
  {
    name: "Pasta",
    items: [
      { name: "Red Sauce Pasta (Penne)", price: 250 },
      { name: "White Sauce Pasta (Penne)", price: 290 },
      { name: "Mix Sauce Pasta (Penne)", price: 290 },
      { name: "Makhani Sauce Pasta (Penne)", price: 310 },
    ],
  },
  {
    name: "From Tandoor",
    items: [
      { name: "Paneer Tikka", price: 280, featured: true },
      { name: "Paneer Malai Tikka", price: 290 },
      { name: "Paneer Achari Tikka", price: 290 },
      { name: "Paneer Hariyali Tikka", price: 290 },
      { name: "Paneer Lehsuni Tikka", price: 300 },
      { name: "Paneer Aflatooni Tikka", price: 320 },
      { name: "Mushroom Tikka", price: 280 },
      { name: "Mushroom Malai Tikka", price: 300 },
      { name: "Veg Seekh Kebab", price: 260 },
      { name: "Tandoori Chaap", price: 240 },
      { name: "Tandoori Malai Chaap", price: 270 },
      { name: "Dahi Ke Sholey", price: 250 },
      { name: "Tandoori Platter", price: 550, desc: "Paneer Tikka, Mushroom Tikka, Soya Chaap, Dahi ke Sholey, Seekh Kebab" },
    ],
  },
  {
    name: "Indian Snacks",
    items: [
      { name: "Samosa with Chutney (2 pcs)", price: 50 },
      { name: "Chole Samose (2 pcs)", price: 70 },
      { name: "Samosa Chaat", price: 80 },
      { name: "Kachori Sabji/Chole", price: 70 },
      { name: "Paneer Pakoda (4 pcs)", price: 120 },
      { name: "Bread Pakoda with Chutney (2 pcs)", price: 60 },
      { name: "Mix Pakora Plate", price: 100 },
    ],
  },
  {
    name: "Main Course",
    items: [
      { name: "Dal Makhani", price: 280 },
      { name: "Black Dal Fry", price: 250 },
      { name: "Yellow Dal Tadka", price: 240 },
      { name: "Dal Handi", price: 260 },
      { name: "Shahi Paneer", price: 370, featured: true },
      { name: "Kadhai Paneer", price: 380 },
      { name: "Paneer Butter Masala", price: 390 },
      { name: "Paneer Lababdaar", price: 390 },
      { name: "Cheese Tomato", price: 380 },
      { name: "Paneer Do Pyaza", price: 390 },
      { name: "Palak Paneer", price: 370 },
      { name: "Matar Paneer", price: 350 },
      { name: "Malai Kofta", price: 390 },
      { name: "Amritsari Kofta", price: 370 },
      { name: "Paneer Methi Malai", price: 380 },
      { name: "Matar Methi Malai", price: 360 },
      { name: "Paneer Hyderabadi Handi", price: 390 },
      { name: "Paneer Bhurji", price: 390 },
      { name: "Matar Mushroom", price: 390 },
      { name: "Mushroom Masala", price: 360 },
      { name: "Chana Masala", price: 350 },
      { name: "Mix Vegetable", price: 300 },
      { name: "Chef Special", price: 440 },
    ],
  },
  {
    name: "Tandoori Bread",
    items: [
      { name: "Tandoori Roti", price: 20 },
      { name: "Butter Roti", price: 30 },
      { name: "Missi Roti", price: 40 },
      { name: "Plain Naan", price: 50 },
      { name: "Butter Naan", price: 60 },
      { name: "Laccha Parantha", price: 60 },
      { name: "Butter Garlic Naan", price: 80 },
      { name: "Green Chilli Parantha", price: 70 },
      { name: "Red Chilli Parantha", price: 60 },
      { name: "Stuffed Naan", price: 80 },
    ],
  },
  {
    name: "Signature Rice",
    items: [
      { name: "Steam Rice", price: 140 },
      { name: "Butter Jeera Rice", price: 180 },
      { name: "Veg Pulao", price: 220 },
      { name: "Paneer Pulao", price: 270 },
      { name: "Veg Biryani", price: 310, featured: true },
      { name: "Kashmiri Biryani", price: 280 },
    ],
  },
  {
    name: "Salad & Raita",
    items: [
      { name: "Green Salad", price: 120 },
      { name: "Onion Salad", price: 80 },
      { name: "Cucumber Salad", price: 80 },
      { name: "Mix Raita", price: 110 },
      { name: "Boondi Raita", price: 100 },
      { name: "Pineapple Raita", price: 130 },
      { name: "Plain Curd", price: 80 },
      { name: "Papad (Dry/Fry)", price: 30 },
    ],
  },
  {
    name: "Thali",
    items: [
      { name: "Regular Thali", price: 220, desc: "Dal Makhani, Mix Veg, Two Butter Roti, Rice and Salad", featured: true },
      { name: "Deluxe Thali", price: 320, desc: "Dal Makhani, Mix Veg, Shahi Paneer, Raita, One Butter Roti, One Butter Naan, Rice and Salad" },
    ],
  },
  {
    name: "Beverages",
    items: [
      { name: "Masala Tea", price: 30 },
      { name: "Hot Coffee", price: 60 },
      { name: "Cold Coffee", price: 110 },
      { name: "Black Coffee", price: 80 },
      { name: "Lime Soda", price: 70 },
      { name: "Sweet Lassi", price: 80 },
      { name: "Salted Lassi", price: 80 },
      { name: "Mix Juice", price: 110 },
      { name: "Soft Drink (Can)", desc: "MRP" },
      { name: "Mineral Water", desc: "MRP" },
    ],
  },
  {
    name: "Shakes",
    items: [
      { name: "Vanilla Shake", price: 120 },
      { name: "Strawberry Shake", price: 120 },
      { name: "Chocolate Shake", price: 140 },
      { name: "Butterscotch Shake", price: 130 },
      { name: "Oreo Shake", price: 150 },
      { name: "Banana Shake", price: 130 },
      { name: "Mango Shake", price: 150 },
    ],
  },
  {
    name: "Mocktails",
    items: [
      { name: "Virgin Mojito", price: 130 },
      { name: "Blue Lagoon", price: 150 },
      { name: "Iced Tea / Peach Iced Tea", price: 140 },
      { name: "Fruit Punch", price: 170 },
    ],
  },
  {
    name: "Desserts",
    desc: "Kuch Meetha Ho Jaye",
    items: [
      { name: "Vanilla Ice Cream", price: 90 },
      { name: "Strawberry Ice Cream", price: 90 },
      { name: "Chocolate Ice Cream", price: 110 },
      { name: "Butterscotch Ice Cream", price: 110 },
      { name: "Ras Malai (Kesar/Kaju)", price: 80 },
      { name: "Rabri", price: 80 },
      { name: "Hot Gulab Jamun (2 pcs)", price: 80, featured: true },
      { name: "Assorted Pastries", price: 200, desc: "Hazelnut / Truffle / Biscoff" },
    ],
  },
  {
    name: "House Special Combos",
    items: [
      { name: "Mini Combo", price: 165, desc: "Veg Burger, French Fries, Soft Drink / Onion Capsicum Pizza, Garlic Bread, Soft Drink" },
      { name: "Chinese Combo", price: 275, desc: "Veg Manchurian, Veg Noodles, Soft Drink / Cheese Chilli, Fried Rice, Soft Drink" },
      { name: "Family Combo", price: 899, desc: "One Pizza, One Pasta, Two French Fries, Two Soft Drinks" },
      { name: "Ultimate Combo", price: 1399, desc: "Two Pizza, One Chinese Sizzler, Two Fries, Four Soft Drinks" },
      { name: "Economical Combo", price: 310, desc: "One Regular Thali, One Ras Malai, One Soft Drink" },
    ],
  },
];

async function main() {
  console.log("Seeding Firestore (aggarwal-sweets-d2a16)...");

  const ts = now();

  // Settings
  await adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.business).set({
    businessName: "RESTRO by Aggarwals",
    logo: "/images/logo.png",
    tagline: "A Pure Veg Restaurant",
    description: "Good food, great taste, memorable moments. A pure vegetarian restaurant serving authentic Indian flavours since 1997.",
    siteVisible: true,
    createdAt: ts,
    updatedAt: ts,
  });

  await adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.homepage).set({
    heroEyebrow: "Since 1997",
    heroHeading: "Authentic Flavours. Timeless Tradition.",
    heroDescription: "A refined pure vegetarian dining experience by Aggarwals.",
    heroPrimaryCta: "Explore Menu",
    heroPrimaryUrl: "/menu",
    heroSecondaryCta: "Contact Us",
    heroSecondaryUrl: "/contact",
    aboutHeading: "Our Story",
    aboutDescription: "RESTRO by Aggarwals is a pure vegetarian restaurant rooted in tradition since 1997. We bring together authentic Indian flavours, warm hospitality, and memorable dining experiences.",
    createdAt: ts,
    updatedAt: ts,
  });

  await adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.seo).set({
    metaTitle: "RESTRO by Aggarwals | Pure Veg Restaurant",
    metaDescription: "RESTRO by Aggarwals — a pure vegetarian restaurant serving authentic Indian flavours since 1997.",
    keywords: "RESTRO, Aggarwals, pure veg restaurant, vegetarian, Indian food, since 1997",
    createdAt: ts,
    updatedAt: ts,
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  for (let i = 0; i < days.length; i++) {
    await adminDb.collection(COLLECTIONS.openingHours).doc(days[i]).set({
      day: days[i],
      dayIndex: i,
      isOpen: true,
      openingTime: "11:00",
      closingTime: "22:30",
    });
  }

  // Admin profile — set ADMIN_UID env to your Firebase Auth UID after creating user
  const adminUid = process.env.ADMIN_UID;
  if (adminUid) {
    await adminDb.collection(COLLECTIONS.admins).doc(adminUid).set({
      name: process.env.ADMIN_NAME ?? "Restaurant Admin",
      email: process.env.ADMIN_EMAIL ?? "admin@restroaggarwals.com",
      role: "SUPER_ADMIN",
      active: true,
      createDate: ts,
      updatedAt: ts,
    });
    console.log("Admin profile created for UID:", adminUid);
  } else {
    console.log("Skipping admin profile — set ADMIN_UID env after creating Firebase Auth user");
  }

  let productCount = 0;
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci];
    const catRef = adminDb.collection(COLLECTIONS.categories).doc();
    await catRef.set({
      name: cat.name,
      categoryId: catRef.id,
      slug: slug(cat.name),
      description: cat.desc ?? null,
      order: ci,
      active: true,
      deleted: false,
      totalProducts: 0,
      createDate: ts,
      updatedAt: ts,
    });

    for (let pi = 0; pi < cat.items.length; pi++) {
      const item = cat.items[pi];
      await adminDb.collection(COLLECTIONS.products).doc().set({
        name: item.name,
        title: item.name,
        slug: slug(item.name),
        shortDescription: item.desc ?? null,
        subtitle: item.desc ?? null,
        description: item.desc ?? null,
        categoryId: catRef.id,
        imageUrl: null,
        variants: [
          {
            id: "regular",
            name: "Regular",
            displayPrice: item.price ?? null,
            originalPrice: null,
            isDefault: true,
          },
        ],
        isFeatured: item.featured ?? false,
        isAvailable: true,
        active: true,
        deleted: false,
        order: pi,
        createDate: ts,
        updatedAt: ts,
      });
      productCount++;
    }
  }

  console.log(`Seeded ${categories.length} categories and ${productCount} products.`);
}

main().catch(console.error);
