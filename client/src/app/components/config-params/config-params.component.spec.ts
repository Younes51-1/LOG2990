import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigParamsComponent } from './config-params.component';

describe('ConfigParamsComponent', () => {
  let component: ConfigParamsComponent;
  let fixture: ComponentFixture<ConfigParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigParamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
