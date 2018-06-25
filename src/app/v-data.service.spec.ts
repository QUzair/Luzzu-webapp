import { TestBed, inject } from '@angular/core/testing';

import { VDataService } from './v-data.service';

describe('VDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VDataService]
    });
  });

  it('should be created', inject([VDataService], (service: VDataService) => {
    expect(service).toBeTruthy();
  }));
});
