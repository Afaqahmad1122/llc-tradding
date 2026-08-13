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
    title: "Audi",
    image: "/Audi.png",
    href: "/cars?brand=audi",
  },
  {
    title: "BMW",
    image: "/BMW.png",
    href: "/cars?brand=bmw",
  },
  {
    title: "Daihatsu",
    image: "/Daihatsu.png",
    href: "/cars?brand=daihatsu",
  },
  {
    title: "Land Rover",
    image: "/Land-Rover.png",
    href: "/cars?brand=land%20rover",
  },
  {
    title: "Mazda",
    image: "/Mazda.png",
    href: "/cars?brand=mazda",
  },
  {
    title: "Mercedes-Benz",
    image: "/Mercedes-Benz.png",
    href: "/cars?brand=mercedes-benz",
  },
  {
    title: "Mitsubishi",
    image: "/Mitsubishi.png",
    href: "/cars?brand=mitsubishi",
  },
  {
    title: "Nissan",
    image: "/Nissan.png",
    href: "/cars?brand=nissan",
  },
  {
    title: "Porsche",
    image: "/Porsche.png",
    href: "/cars?brand=porsche",
  },
  {
    title: "Subaru",
    image: "/Subaru.png",
    href: "/cars?brand=subaru",
  },
  {
    title: "Suzuki",
    image: "/Suzuki.png",
    href: "/cars?brand=suzuki",
  },
];

export const brandLogoNavItems: LogoNavItem[] = [
  {
    name: "Toyota",
    count: 73902,
    image: "/bernardsie-toyota-1596082_1920.png",
    href: "/cars?brand=toyota",
  },
  {
    name: "Honda",
    count: 23630,
    image: "/bernardsie-honda-1596081_1920.png",
    href: "/cars?brand=honda",
  },
  {
    name: "Nissan",
    count: 24515,
    image: "/Nissan.png",
    href: "/cars?brand=nissan",
  },
  {
    name: "Mazda",
    count: 9276,
    image: "/Mazda.png",
    href: "/cars?brand=mazda",
  },
  {
    name: "Suzuki",
    count: 21289,
    image: "/Suzuki.png",
    href: "/cars?brand=suzuki",
  },
  {
    name: "Mitsubishi",
    count: 6548,
    image: "/Mitsubishi.png",
    href: "/cars?brand=mitsubishi",
  },
  {
    name: "Subaru",
    count: 9499,
    image: "/Subaru.png",
    href: "/cars?brand=subaru",
  },
  {
    name: "Volkswagen",
    count: 3523,
    image: "/body-types/download (4).jpeg",
    href: "/cars?brand=volkswagen",
  },
  {
    name: "BMW",
    count: 9648,
    image: "/BMW.png",
    href: "/cars?brand=bmw",
  },
  {
    name: "Audi",
    count: 4379,
    image: "/Audi.png",
    href: "/cars?brand=audi",
  },
  {
    name: "Hyundai",
    count: 22089,
    image: "/body-types/download (11).jpeg",
    href: "/cars?brand=hyundai",
  },
  {
    name: "Kia",
    count: 33448,
    image: "/body-types/download (12).jpeg",
    href: "/cars?brand=kia",
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
