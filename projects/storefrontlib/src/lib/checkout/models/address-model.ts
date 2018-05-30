export interface Address {
  titleCode: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  line1: string;
  line2: string;
  town: string;
  region: {
    isocode: string;
  };
  postalCode: string;
  phone?: string;
  email?: string;
  country: {
    isocode: string;
    name?: string;
  };
}