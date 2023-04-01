import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeChatBoxComponent } from './replay-chat-box.component';

describe('FakeChatBoxComponent', () => {
    let component: FakeChatBoxComponent;
    let fixture: ComponentFixture<FakeChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FakeChatBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FakeChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
