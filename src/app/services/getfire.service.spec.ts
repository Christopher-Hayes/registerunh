import { TestBed } from '@angular/core/testing';

import { GetfireService } from './getfire.service';

describe('GetfireService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetfireService = TestBed.get(GetfireService);
    expect(service).toBeTruthy();
  });
});
