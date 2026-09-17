export interface CourseRow {
  booked_seats: number;
  certificate: boolean;
  created_at: string;
  description: string;
  display_order: number;
  duration: string;
  faqs: any;
  id: string;
  learn_points: any;
  mode: string;
  modules: any;
  offer_price: number | null;
  price: number;
  price_type: string;
  projects: any;
  seats_warning: boolean;
  slug: string;
  start_date: string;
  status: string;
  tags: any;
  testimonials: any;
  title: string;
  total_seats: number;
  trainer: any;
  updated_at: string;
}

export type Tables<T extends string> = T extends "courses" ? CourseRow : any;
