export interface VehicleType {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  selected: boolean;
  categories?: Category[]
}
