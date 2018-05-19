import { TestBed, inject } from '@angular/core/testing';

import { RouterCommunicationService } from './router-communication.service';

describe('RouterCommunicationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouterCommunicationService]
    });
  });

  it('should be created', inject([RouterCommunicationService], (service: RouterCommunicationService) => {
    expect(service).toBeTruthy();
  }));
});
