export type FilterItem = {
  label: string;
};

export type CategoryItem = {
  name: string;
  count: number;
};

export type VehicleItem = {
  make: string;
  model: string;
  year: number;
  engine: string;
  price: string;
  reference: string;
  highlight?: string;
};

export type TestimonialItem = {
  name: string;
  country: string;
  quote: string;
  rating: string;
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

export const stats = [
  { label: "Total Cars in Stock", value: "42,481" },
  { label: "Insured Global Shipping", value: "120+ Countries" },
  { label: "Customer Satisfaction", value: "99%" },
];

export const categories: CategoryItem[] = [
  { name: "New Arrivals", count: 2566 },
  { name: "Clearance", count: 9028 },
  { name: "Third Party", count: 27457 },
  { name: "Machinery", count: 1416 },
  { name: "UAE Stock", count: 1009 },
  { name: "Thailand Stock", count: 103 },
];

export const featuredVehicles: VehicleItem[] = [
  {
    make: "Nissan",
    model: "Caravan",
    year: 2018,
    engine: "2.5L Diesel",
    price: "$8,900",
    reference: "AT27411",
    highlight: "Best Deal",
  },
  {
    make: "Toyota",
    model: "Allion",
    year: 2016,
    engine: "1.5L Petrol",
    price: "$5,400",
    reference: "AT27409",
  },
  {
    make: "Toyota",
    model: "Hiace Van",
    year: 2017,
    engine: "2.0L Petrol",
    price: "$10,600",
    reference: "AT27403",
    highlight: "Bulk Discount",
  },
  {
    make: "Toyota",
    model: "Voxy",
    year: 2015,
    engine: "2.0L Petrol",
    price: "$4,600",
    reference: "AT27398",
  },
];

export const latestVehicles: VehicleItem[] = [
  {
    make: "Toyota",
    model: "Belta X",
    year: 2011,
    engine: "1300cc",
    price: "$3,800",
    reference: "AT27433",
  },
  {
    make: "Toyota",
    model: "Wish 1.8X",
    year: 2014,
    engine: "1800cc",
    price: "$3,400",
    reference: "AT27432",
  },
  {
    make: "Honda",
    model: "Fit Smart",
    year: 2013,
    engine: "1300cc",
    price: "$4,000",
    reference: "AT27430",
  },
  {
    make: "Nissan",
    model: "Serena Hybrid",
    year: 2017,
    engine: "2000cc",
    price: "$4,600",
    reference: "AT27425",
  },
  {
    make: "Toyota",
    model: "Raize Z",
    year: 2021,
    engine: "1000cc",
    price: "$13,500",
    reference: "AT27421",
    highlight: "Premium",
  },
  {
    make: "Toyota",
    model: "Aqua S",
    year: 2015,
    engine: "1500cc",
    price: "$3,600",
    reference: "AT27420",
  },
];

export const testimonials: TestimonialItem[] = [
  {
    name: "Alisha Jno Jules",
    country: "Antigua and Barbuda",
    rating: "5.0 / 5",
    quote:
      "My Audi Q5 arrived in excellent condition with a clean interior and smooth performance. The overall quality exceeded my expectations.",
  },
  {
    name: "Waqas Ali",
    country: "United Kingdom",
    rating: "5.0 / 5",
    quote:
      "The purchase process was transparent and hassle free. Communication stayed clear at every step, and the vehicle matched the listing details.",
  },
];
