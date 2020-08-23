import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotimplementedComponent } from './notimplemented.component';

describe('NotimplementedComponent', () => {
  let component: NotimplementedComponent;
  let fixture: ComponentFixture<NotimplementedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotimplementedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotimplementedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
