import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShoppingCart } from 'src/app/models/shoppingcart';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  userId;
  totalPrice: number;
  checkOutItems = new Order();

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private checkOutService: CheckoutService) {
    this.userId = localStorage.getItem('userId');
  }

  checkOutForm = this.fb.group({
    name: ['', Validators.required],
    addressLine1: ['', Validators.required],
    addressLine2: ['', Validators.required],
    pincode: ['', Validators.compose([Validators.required, Validators.pattern('^[1-9][0-9]{5}$')])],
    state: ['', [Validators.required]]
  });

  get name() {
    return this.checkOutForm.get('name');
  }

  get addressLine1() {
    return this.checkOutForm.get('addressLine1');
  }

  get addressLine2() {
    return this.checkOutForm.get('addressLine2');
  }

  get pincode() {
    return this.checkOutForm.get('pincode');
  }
  get state() {
    return this.checkOutForm.get('state');
  }

  ngOnInit() {
    this.getCheckOutItems();
  }

  getCheckOutItems() {
    this.cartService.getCartItems(this.userId).subscribe(
      (result: ShoppingCart[]) => {
        this.checkOutItems.orderDetails = result;
        this.getTotalPrice();
      }, error => {
        console.log('Error ocurred while fetching shopping cart item : ', error);
      });
  }

  getTotalPrice() {
    this.totalPrice = 0;
    this.checkOutItems.orderDetails.forEach(item => {
      this.totalPrice += (item.book.price * item.quantity);
    });
    this.checkOutItems.cartTotal = this.totalPrice;
  }

  placeOrder() {
    if (this.checkOutForm.valid) {
      this.checkOutService.placeOrder(this.userId, this.checkOutItems).subscribe(
        result => {
          this.userService.cartItemcount$.next(result);
          this.router.navigate(['/myorders']);
        }, error => {
          console.log('Error ocurred while placing order : ', error);
        });
    }
  }

}