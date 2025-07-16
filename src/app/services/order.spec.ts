import { TestBed } from '@angular/core/testing';

import { Order } from './order';
import { beforeEach, describe, it } from 'node:test';

describe('Order', () => {
  let service: Order;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Order);
  });

  it('should be created', () => {
    // @ts-ignore
    expect(service).toBeTruthy();
  });
});
