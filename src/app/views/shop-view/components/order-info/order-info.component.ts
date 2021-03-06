import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {interval, mergeMap, Subscription} from 'rxjs';
import {NotificationService} from 'src/app/common/notification.service';
import {Order, OrderType, ShopService} from 'src/app/common/shop.service';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss']
})
export class OrderInfoComponent implements OnInit, OnDestroy {
  OrderType = OrderType
  reloadTime = 30*1000

  @Input() shopID = ''

  orders: Order[] = []
  showOrders = OrderType.Active
  subUpdate!: Subscription

  constructor(
    private shopService: ShopService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.subUpdate = interval(this.reloadTime).subscribe(_ => this.updateList())
    this.updateList()
  }

  toggleOrderType() {
    this.showOrders = this.showOrders === OrderType.Active? OrderType.Done : OrderType.Active
    this.updateList()
  }

  updateList() {
    // TODO: Uncomment this when API is done.
    this.shopService.getOrders(this.shopID, this.showOrders).subscribe({
      next: res => this.orders = res,
      error: err =>
        this.notificationService.notify('Error updating order list: ' + err, 'danger')
    })
  }

  finishOrder(order: Order) {
    this.shopService.finishOrder(this.shopID, order).subscribe({
      next: _ => {
        this.orders = this.orders.filter(o => o.id !== order.id)
        this.notificationService.notify('Order finished successfully!', 'success')
      },
      error: err =>
        this.notificationService.notify('Error finishing order: ' + err, 'danger')
    })
  }

  declineOrder(order: Order) {
    this.shopService.declineOrder(this.shopID, order).subscribe({
      next: _ => {
        this.orders = this.orders.filter(o => o.id !== order.id)
        this.notificationService.notify('Order aborted successfully!', 'success')
      },
      error: err =>
        this.notificationService.notify('Error aborting order: ' + err, 'danger')
    })
  }

  ngOnDestroy() {
    if(this.subUpdate)
      this.subUpdate.unsubscribe()
  }
}
