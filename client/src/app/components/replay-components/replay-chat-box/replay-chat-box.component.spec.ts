import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayChatBoxComponent } from './replay-chat-box.component';

describe('ReplayChatBoxComponent', () => {
    let component: ReplayChatBoxComponent;
    let fixture: ComponentFixture<ReplayChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReplayChatBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
