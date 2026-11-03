import {
  Snowflake,
  GraduationCap,
  BedSingle,
  Luggage,
  CookingPot,
  PlugZap,
  Award,
  BadgeCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const img = (id: string) =>
  `https://api.builder.io/api/v1/image/assets/TEMP/${id}?width=580`;

export interface Listing {
  name: string;
  location: string;
  distance: string;
  roomType: string;
  price: string;
  rating: string;
  reviews: number;
  badge: { label: string; icon: LucideIcon };
  image: string;
}

export const categories: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Aircon Rooms", icon: Snowflake },
  { label: "Near Campus", icon: GraduationCap, active: true },
  { label: "Solo Room", icon: BedSingle },
  { label: "Transient", icon: Luggage },
  { label: "With Kitchen", icon: CookingPot },
  { label: "Inclusive of Utilities", icon: PlugZap },
];

export const listings: Listing[] = [
  {
    name: "The Sage House",
    location: "Los Baños, Laguna",
    distance: "5 min walk to UPLB",
    roomType: "Single room · Aircon",
    price: "₱3,500",
    rating: "4.9",
    reviews: 48,
    badge: { label: "Guest favorite", icon: Award },
    image: img("999fb50e8d124e8bacee2a646cef5f5e2fc2c948"),
  },
  {
    name: "The Study Nook",
    location: "Katipunan, Quezon City",
    distance: "8 min walk to Ateneo",
    roomType: "Single room · Wi-Fi",
    price: "₱5,500",
    rating: "4.8",
    reviews: 32,
    badge: { label: "Verified", icon: BadgeCheck },
    image: img("eee16bf4b31dbdda3c8ae13090d938f4a70d78c4"),
  },
  {
    name: "Casa Lumière",
    location: "España, Manila",
    distance: "4 min walk to UST",
    roomType: "Shared room · 2 guests",
    price: "₱3,000",
    rating: "4.9",
    reviews: 61,
    badge: { label: "Great value", icon: Sparkles },
    image: img("9ff8c60733468f9cade62b59e5bb6dc15d38f63d"),
  },
  {
    name: "Little Haven Studios",
    location: "Taft Avenue, Manila",
    distance: "6 min walk to DLSU",
    roomType: "Single room · Kitchenette",
    price: "₱6,000",
    rating: "4.8",
    reviews: 27,
    badge: { label: "Verified", icon: BadgeCheck },
    image: img("ad39ce99d4d39394a6fa9711805acb5ec0a9c7fe"),
  },
  {
    name: "Maple Residences",
    location: "Diliman, Quezon City",
    distance: "7 min ride to UP Diliman",
    roomType: "Single room · Study desk",
    price: "₱4,200",
    rating: "4.7",
    reviews: 36,
    badge: { label: "Verified", icon: BadgeCheck },
    image: img("615c9dc14d4887e09df4d9cfd1887a0edde00363"),
  },
  {
    name: "Olive & Oak Dorm",
    location: "P. Noval, Manila",
    distance: "3 min walk to UST",
    roomType: "Shared room · Aircon",
    price: "₱2,800",
    rating: "4.8",
    reviews: 54,
    badge: { label: "Great value", icon: Sparkles },
    image: img("31701a4ecc5ae7d08259f92309d9b7b7ffbc279b"),
  },
  {
    name: "The Garden Terrace",
    location: "Los Baños, Laguna",
    distance: "10 min walk to UPLB",
    roomType: "Single room · Garden view",
    price: "₱3,800",
    rating: "4.9",
    reviews: 23,
    badge: { label: "Guest favorite", icon: Award },
    image: img("47ba6a7621a8d34185398bdbe600f2995a461da4"),
  },
  {
    name: "Slow Mornings Stay",
    location: "Cebu City, Cebu",
    distance: "5 min walk to USC Talamban",
    roomType: "Single room · Utilities included",
    price: "₱4,500",
    rating: "4.8",
    reviews: 41,
    badge: { label: "Verified", icon: BadgeCheck },
    image: img("4e3ffdf53620de3d321712c80ade9c5578eeba63"),
  },
];
