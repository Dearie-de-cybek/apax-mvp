import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/userModel";
import Holding from "../models/holdingModel";

// Local demo data: one user with gold, silver and platinum, one with an empty vault
const DEMO_PASSWORD = "vault-demo-2026";

const demoUsers = [
  {
    name: "Amina Yusuf",
    email: "demo@apax.local",
    holdings: { gold: 156.75, silver: 892.4, platinum: 45.2 },
  },
  {
    name: "Tunde Bello",
    email: "empty@apax.local",
    holdings: null,
  },
];

const seed = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  await mongoose.connect(process.env.MONGO_URI);

  for (const demo of demoUsers) {
    await User.deleteOne({ email: demo.email });
    const user = await User.create({
      name: demo.name,
      email: demo.email,
      gender: "unspecified",
      password: DEMO_PASSWORD,
    });

    await Holding.deleteMany({ user: user._id });
    if (demo.holdings) {
      await Holding.insertMany(
        Object.entries(demo.holdings).map(([asset, amount]) => ({ user: user._id, asset, amount }))
      );
    }

    console.log(`Seeded ${demo.email} / ${DEMO_PASSWORD}`);
  }

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
