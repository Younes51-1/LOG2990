import { HttpResponse, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { NgModule } from '@angular/core';

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent],
            imports: [DynamicTestModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
