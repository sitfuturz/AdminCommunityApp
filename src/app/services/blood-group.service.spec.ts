import { TestBed } from '@angular/core/testing';

import { BloodGroupService } from './blood-group.service';

describe('BloodGroupService', () => {
  let service: BloodGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
