import { TestBed } from '@angular/core/testing';

import { MainsvcService } from './mainsvc.service';

describe('MainsvcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MainsvcService = TestBed.get(MainsvcService);
    expect(service).toBeTruthy();
  });
});
