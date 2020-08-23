import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskerComponent } from './tasker.component';

describe('TaskerComponent', () => {
  let component: TaskerComponent;
  let fixture: ComponentFixture<TaskerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
