import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NohashComponent } from './nohash.component';

describe('NohashComponent', () => {
  let component: NohashComponent;
  let fixture: ComponentFixture<NohashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NohashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NohashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
