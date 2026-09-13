export const isNumeric = (value: any) => /^\d+$/.test(value);

export const isNonEmptyString = (value: any) => typeof value === 'string' && value.trim().length > 0;

export const isPositiveNumber = (value: any) => Number(value) > 0;

export const validateField = (name: string, value: any): string | null => {
  switch (name) {
    case 'fullName':
    case 'model':
    case 'description':
      return isNonEmptyString(value) ? null : 'This field is required';
    case 'price':
      return isPositiveNumber(value) ? null : 'Price must be a positive number';
    case 'category_id':
    case 'brand_id':
     case 'city': 
      return isNumeric(value) ? null : 'Select a valid option';
    default:
      return null;
  }
};
