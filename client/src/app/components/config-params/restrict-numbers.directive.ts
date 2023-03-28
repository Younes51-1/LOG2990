import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appRestrictNumbers]',
})
export class RestrictNumbersDirective {
    constructor(private elementRef: ElementRef) {}

    @HostListener('input', ['$event']) onInputChange(event: { stopPropagation: () => void }) {
        const initialValue = this.elementRef.nativeElement.value;
        this.elementRef.nativeElement.value = initialValue.replace(/[^0-9]*/g, '');
        if (initialValue !== this.elementRef.nativeElement.value) {
            event.stopPropagation();
        }
    }
}
