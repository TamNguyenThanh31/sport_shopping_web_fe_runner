import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone',
    standalone: false
})
export class PhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Check if the input is valid
    if (cleaned.length !== 10) return value;

    // Format as (XXX) XXX-XXXX
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
}
