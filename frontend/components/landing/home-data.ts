export type FilterItem = {
  label: string;
};

export type CategoryItem = {
  name: string;
  count: number;
};

export type CurrencyItem = {
  code: string;
  active?: boolean;
};

export type PromoBannerItem = {
  title: string;
  image: string;
  href: string;
};

export type LogoNavItem = {
  name: string;
  count: number;
  image: string;
  href: string;
};

export const noticeText =
  "Payment policy: we only accept official company payments to our Japan account. Contact support immediately for suspicious requests.";

export const heroFilters: FilterItem[] = [
  { label: "Make" },
  { label: "Price" },
  { label: "Body Type" },
  { label: "Category" },
  { label: "Location" },
  { label: "Year" },
  { label: "Drive" },
  { label: "Transmission" },
];


export const currencyItems: CurrencyItem[] = [
  { code: "USD" },
  { code: "JPY" },
  { code: "EUR", active: true },
  { code: "GBP" },
];

export const rightSidebarFilters = [
  "Make",
  "Model",
  "Model Code",
  "Steering",
  "Year From",
  "Year To",
];

export const promoBanners: PromoBannerItem[] = [
  {
    title: "Honda",
    image: "/bernardsie-honda-1596081_1920.png",
    href: "/cars?make=honda",
  },
  {
    title: "Toyota",
    image: "/bernardsie-toyota-1596082_1920.png",
    href: "/cars?make=toyota",
  },
  {
    title: "WordPress",
    image: "/doki7-wordpress-581849_1920.jpg",
    href: "/help/faqs",
  },
];

export const brandLogoNavItems: LogoNavItem[] = [
  {
    name: "Toyota",
    count: 73902,
    image: "/bernardsie-toyota-1596082_1920.png",
    href: "/cars?make=toyota",
  },
  {
    name: "Honda",
    count: 23630,
    image: "/bernardsie-honda-1596081_1920.png",
    href: "/cars?make=honda",
  },
  {
    name: "Nissan",
    count: 24515,
    image: "/body-types/download.png",
    href: "/cars?make=nissan",
  },
  {
    name: "Mazda",
    count: 9276,
    image: "/body-types/download.jpeg",
    href: "/cars?make=mazda",
  },
  {
    name: "Suzuki",
    count: 21289,
    image: "/body-types/download (1).png",
    href: "/cars?make=suzuki",
  },
  {
    name: "Mitsubishi",
    count: 6548,
    image: "/body-types/download (2).png",
    href: "/cars?make=mitsubishi",
  },
  {
    name: "Subaru",
    count: 9499,
    image: "/body-types/download (2).jpeg",
    href: "/cars?make=subaru",
  },
  {
    name: "Volkswagen",
    count: 3523,
    image: "/body-types/download (4).jpeg",
    href: "/cars?make=volkswagen",
  },
  {
    name: "BMW",
    count: 9648,
    image: "/body-types/download (3).png",
    href: "/cars?make=bmw",
  },
  {
    name: "Audi",
    count: 4379,
    image: "/body-types/download (5).png",
    href: "/cars?make=audi",
  },
  {
    name: "Hyundai",
    count: 22089,
    image: "/body-types/download (11).jpeg",
    href: "/cars?make=hyundai",
  },
  {
    name: "Kia",
    count: 33448,
    image: "/body-types/download (12).jpeg",
    href: "/cars?make=kia",
  },
];

export const bodyTypeLogoNavItems: LogoNavItem[] = [
  {
    name: "Sedan",
    count: 72983,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=sedan",
  },
  {
    name: "Coupe",
    count: 7177,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=coupe",
  },
  {
    name: "Hatchback",
    count: 50739,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=hatchback",
  },
  {
    name: "Station Wagon",
    count: 9183,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=station-wagon",
  },
  {
    name: "SUV",
    count: 76469,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=suv",
  },
  {
    name: "Pick up",
    count: 7140,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=pick-up",
  },
  {
    name: "Van",
    count: 11576,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=van",
  },
  {
    name: "Mini Van",
    count: 30895,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=mini-van",
  },
  {
    name: "Wagon",
    count: 25046,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=wagon",
  },
  {
    name: "Convertible",
    count: 3276,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=convertible",
  },
  {
    name: "Bus",
    count: 158,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=bus",
  },
  {
    name: "Truck",
    count: 10392,
    image: "/body-types/bodytype-placeholder.svg",
    href: "/cars?bodyType=truck",
  },
];
