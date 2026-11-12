// Default site content. The owner edits it at /admin; saved edits live in data/site.json and are
// merged over these defaults (see sanitize.ts). Read it with getContent() / useContent(), not directly.

// TODO(client): set the real phone / WhatsApp / email (from /admin).
const CONTACT = {
  phone: "+919000000000",
  phoneDisplay: "+91 90000 00000",
  whatsapp: "919000000000",
  email: "hello@aaisahebtours.com",
  city: "Nashik, Maharashtra",
};

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/fleet" },
  { label: "Tariff", href: "/tariffs" },
  { label: "Routes", href: "/routes" },
  { label: "Destinations", href: "/destinations" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export type CarId = "sedan" | "ertiga" | "innova";

const FLEET = [
  {
    id: "sedan" as CarId,
    name: "Premium Sedan",
    model: "Maruti Dzire or similar",
    tagline: "Quiet, nimble, efficient.",
    description:
      "The smart choice for couples and small families — city errands, temple visits and quick intercity drops in air-conditioned comfort.",
    images: ["/images/car-sedan.webp"],
    cut: "city" as CutId,
    seats: "4 + driver",
    bags: "2 bags",
    local: "₹2,500 – 3,000",
    perKm: "₹12 – 14",
    features: ["Air-conditioned", "Music & charging", "Clean, sanitised cabin", "Experienced driver"],
    accent: "#a5792b",
  },
  {
    id: "ertiga" as CarId,
    name: "Ertiga / XUV",
    model: "Maruti Ertiga or Mahindra XUV",
    tagline: "Room for the whole family.",
    description:
      "Seven seats, a generous boot and an easy ride — built for family pilgrimages, weekend getaways and long highway days.",
    images: ["/images/car-ertiga.webp", "/images/car-xuv.webp"],
    cut: "ertiga" as CutId,
    seats: "6 + driver",
    bags: "3 bags",
    local: "₹3,500 – 4,000",
    perKm: "₹14 – 16",
    features: ["7-seater comfort", "Roof-mounted AC vents", "Large boot", "Highway-ready"],
    accent: "#0e6b63",
  },
  {
    id: "innova" as CarId,
    name: "Innova Crysta",
    model: "Toyota Innova Crysta",
    tagline: "India's favourite highway lounge.",
    description:
      "Captain-seat comfort and a composed, quiet ride. The car corporate guests, wedding parties and all-India tours ask for by name.",
    images: ["/images/car-innova.webp", "/images/car-innova-side.webp"],
    cut: "innova-crysta" as CutId,
    seats: "6–7 + driver",
    bags: "4 bags",
    local: "₹4,500 – 5,000",
    perKm: "₹20",
    features: ["Captain seats", "Dual AC", "Premium ride quality", "Ideal for long tours"],
    accent: "#7c2d3b",
  },
];

const ROUTES = [
  {
    id: "mumbai-nashik",
    from: "Mumbai",
    to: "Nashik",
    km: 167,
    time: "≈ 4 hrs",
    via: "Kasara Ghat · NH 160",
    image: "/images/mumbai.webp",
    prices: { sedan: "₹2,700 – 3,000", ertiga: "₹3,500 – 4,500", innova: "₹6,000 – 7,000" },
  },
  {
    id: "nashik-pune",
    from: "Nashik",
    to: "Pune",
    km: 210,
    time: "≈ 5 hrs",
    via: "Sangamner · NH 60",
    image: "/images/pune.webp",
    prices: { sedan: "₹3,500", ertiga: "₹4,500", innova: "₹8,000" },
  },
  {
    id: "pune-nashik",
    from: "Pune",
    to: "Nashik",
    km: 210,
    time: "≈ 5 hrs",
    via: "Narayangaon · NH 60",
    image: "/images/nashik-ghat.webp",
    prices: { sedan: "₹3,500", ertiga: "₹4,500", innova: "₹6,000" },
  },
];

// Side-view cutouts (public/images/cars). Wheel boxes are % of the image (rim centre + size, measured
// per photo). Each wheel image is a rotational motion-blur of that rim: perfectly round, so it never wobbles.
export const CUTS = {
  swift: { aspect: 2.2623, wheels: [{ x: 11.31, y: 77.91, w: 10.85, h: 24.55 }, { x: 77.33, y: 81.4, w: 11.08, h: 25.06 }] },
  city: { aspect: 3.024, wheels: [{ x: 20.74, y: 79.34, w: 11.23, h: 33.95 }, { x: 80.72, y: 78.78, w: 11.23, h: 33.95 }] },
  ertiga: { aspect: 2.5199, wheels: [{ x: 15.42, y: 81.69, w: 10.01, h: 25.22 }, { x: 78.0, y: 81.52, w: 10.83, h: 27.29 }] },
  "innova-crysta": { aspect: 2.4789, wheels: [{ x: 20.57, y: 80.31, w: 9.7, h: 24.05 }, { x: 83.49, y: 84.11, w: 10.5, h: 26.02 }] },
};
export type CutId = keyof typeof CUTS;

// The home-page road trip: the car upgrades as the landscape changes.
const JOURNEY: {
  place: string;
  region: string;
  line: string;
  km: number;
  image: string;
  car: CutId;
  carLabel: string;
  accent: string;
  grade: string;
  milestone: string;
}[] = [
  {
    place: "Mumbai",
    region: "Marine Drive",
    line: "Every great road trip starts at the sea.",
    km: 0,
    image: "/images/road-mumbai.webp",
    car: "swift",
    carLabel: "Compact hatchback",
    accent: "#e0bd6a",
    grade: "linear-gradient(180deg, rgba(8,32,30,.6) 0%, rgba(8,32,30,.15) 45%, transparent 70%)",
    milestone: "NASHIK 167",
  },
  {
    place: "Sahyadri",
    region: "Western Ghats",
    line: "Up through monsoon-green ghats.",
    km: 180,
    image: "/images/road-sahyadri.webp",
    car: "city",
    carLabel: "Premium Sedan",
    accent: "#e0bd6a",
    grade: "linear-gradient(180deg, rgba(8,32,30,.6) 0%, rgba(8,32,30,.15) 45%, transparent 70%)",
    milestone: "PUNE 210",
  },
  {
    place: "Thar",
    region: "Jaisalmer, Rajasthan",
    line: "Into endless golden dunes.",
    km: 1730,
    image: "/images/road-thar.webp",
    car: "ertiga",
    carLabel: "Ertiga / XUV · 7-seater",
    accent: "#e0bd6a",
    grade: "linear-gradient(180deg, rgba(8,32,30,.6) 0%, rgba(8,32,30,.15) 45%, transparent 70%)",
    milestone: "LEH 1,190",
  },
  {
    place: "Ladakh",
    region: "Pangong Tso",
    line: "And finally, the roof of the world.",
    km: 2920,
    image: "/images/road-ladakh.webp",
    car: "innova-crysta",
    carLabel: "Toyota Innova Crysta",
    accent: "#e0bd6a",
    grade: "linear-gradient(180deg, rgba(8,32,30,.6) 0%, rgba(8,32,30,.15) 45%, transparent 70%)",
    milestone: "KHARDUNG LA 39",
  },
];

const DESTINATIONS = [
  { title: "Ladakh & Pangong", region: "Himalaya", image: "/images/pangong.webp", blurb: "High passes, blue lakes and prayer-flag skies." },
  { title: "Jaipur", region: "Rajasthan", image: "/images/jaipur.webp", blurb: "The Pink City's palaces and bazaars." },
  { title: "Jaisalmer Dunes", region: "Rajasthan", image: "/images/dunes.webp", blurb: "Golden fort, camel trails and desert sunsets." },
  { title: "Kerala Backwaters", region: "South India", image: "/images/kerala.webp", blurb: "Palm-lined canals and slow houseboat days." },
  { title: "Kashmir Valley", region: "Kashmir", image: "/images/kashmir.webp", blurb: "Snow peaks, pine forests and alpine meadows." },
  { title: "Nashik", region: "Maharashtra", image: "/images/nashik-ghat.webp", blurb: "Godavari ghats, Trimbakeshwar and the vineyards." },
  { title: "Western Ghats", region: "Maharashtra & Kerala", image: "/images/sahyadri.webp", blurb: "Monsoon-green peaks, forts and waterfalls." },
  { title: "Himalayan Passes", region: "Himalaya", image: "/images/himalaya-flags.webp", blurb: "Prayer flags, high passes and big skies." },
];

// Landscapes are from Unsplash (Unsplash License). Car photos are from Wikimedia Commons:
export const CREDITS = [
  ["Maruti Dzire", "Biswarup Ganguly", "CC BY 3.0"],
  ["Toyota Innova Crysta", "Premnath Kudva", "CC BY-SA 4.0"],
  ["Toyota Innova (side)", "Bindydad123", "CC BY-SA 4.0"],
  ["Maruti Ertiga", "Ramakrishna Mission Vidyapith", "Public domain"],
  ["Mahindra XUV700", "LuvsMG481", "CC BY-SA 4.0"],
  ["Suzuki Swift (side)", "Charles01", "CC BY-SA 4.0"],
  ["Honda City (side)", "William Mariano", "CC BY-SA 4.0"],
  ["Suzuki Ertiga (side)", "RichardSummersault", "CC0"],
];

// Big photos on each page: "hero" = top banner, "cta" = the "Your seat is waiting" banner at the bottom.
const PAGES = {
  home: { cta: "/images/desert-sunset.webp" },
  fleet: { hero: "/images/ladakh-road.webp", cta: "/images/sahyadri.webp" },
  tariffs: { hero: "/images/nashik.webp", cta: "/images/nashik-ghat.webp" },
  routes: { hero: "/images/expressway.webp", cta: "/images/sealink.webp" },
  destinations: { hero: "/images/dunes.webp", cta: "/images/kerala.webp" },
  about: { hero: "/images/himalaya-flags.webp", photo: "/images/sahyadri.webp", cta: "/images/pangong.webp" },
  contact: { hero: "/images/sealink.webp" },
};

export const DEFAULT_CONTENT = { contact: CONTACT, fleet: FLEET, routes: ROUTES, journey: JOURNEY, destinations: DESTINATIONS, pages: PAGES };
export type Content = typeof DEFAULT_CONTENT;
