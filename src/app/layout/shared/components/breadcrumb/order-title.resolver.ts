import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OrderService } from '../../../../services/order';


@Injectable({ providedIn: 'root' })
export class OrderTitleResolver implements Resolve<string> {
  constructor(private orderService: OrderService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string> {
    const orderId = route.paramMap.get('id')!;
    return this.orderService.getOrderById(orderId).pipe(
      map(order => order.name || `${orderId}`),
      catchError(() => of(`${orderId}`))
    );
  }
}
