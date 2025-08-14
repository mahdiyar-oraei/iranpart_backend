export enum ProductDisplayType {
  SHOW_ALL = 'show_all', // Shows on both cash and credit filter
  CASH_ONLY = 'cash_only', // Shows only on cash filter
  CREDIT_ONLY = 'credit_only', // Shows only on credit filter
  SHOW_NO_CART = 'show_no_cart', // Shows but couldn't add to cart
  DO_NOT_DISPLAY = 'do_not_display', // Do not display
}
