import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashsimpleComponent } from './dashsimple.component';

describe('DashsimpleComponent', () => {
  let component: DashsimpleComponent;
  let fixture: ComponentFixture<DashsimpleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashsimpleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashsimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
