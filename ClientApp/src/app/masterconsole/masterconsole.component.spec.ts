import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterconsoleComponent } from './masterconsole.component';

describe('MasterconsoleComponent', () => {
  let component: MasterconsoleComponent;
  let fixture: ComponentFixture<MasterconsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterconsoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterconsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
