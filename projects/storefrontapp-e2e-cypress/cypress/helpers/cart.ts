import { standardUser } from '../sample-data/shared-users';
import { apiUrl } from '../support/utils/login';
import { login, register } from './auth-forms';
import { generateMail, randomString } from './user';

interface TestProduct {
  code: string;
  type?: string;
  name?: string;
  price?: number;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);

export const products: TestProduct[] = [
  {
    code: '1934793',
    type: 'camera',
    name: 'PowerShot A480',
    price: 99.85,
  },
  {
    code: '300938',
    type: 'camera',
    name: 'Photosmart E317 Digital Camera',
    price: 114.12,
  },
  {
    code: '3470545',
    type: 'camera',
    name: 'EASYSHARE M381',
    price: 370.72,
  },
  {
    code: '29925',
  },
];

function getCartItem(name: string) {
  return cy.get('cx-cart-item-list').contains('cx-cart-item', name);
}

function checkCartSummary(subtotal: string) {
  cy.get('cx-order-summary').within(() => {
    cy.get('.cx-summary-row:first').contains('Subtotal');
    cy.get('.cx-summary-amount').should('contain', subtotal);
  });
}

function incrementQuantity() {
  cy.get('.cx-counter-action')
    .contains('+')
    .click();
}

function goToFirstProductFromSearch(id: string, mobile: boolean) {
  cy.get('cx-storefront.stop-navigating');
  if (mobile) {
    cy.get('cx-searchbox cx-icon[aria-label="search"]').click();
    cy.get('cx-searchbox input')
      .clear({ force: true })
      .type(id, { force: true })
      .type('{enter}', { force: true });
    cy.get('cx-product-list-item')
      .first()
      .get('.cx-product-name')
      .first()
      .click();
  } else {
    cy.get('cx-searchbox input')
      .clear({ force: true })
      .type(id, { force: true });
    cy.get('cx-searchbox')
      .get('.results .products .name')
      .first()
      .click();
  }
}

function checkMiniCartCount(expectedCount) {
  return cy.get('cx-mini-cart').within(() => {
    cy.get('.count').should('contain', expectedCount);
  });
}

export function validateEmptyCart() {
  cy.get('cx-breadcrumb h1').should('contain', 'Your Shopping Cart');
  cy.get('.EmptyCartMiddleContent').should(
    'contain',
    'Your shopping cart is empty'
  );
}

export function addToCart() {
  cy.get('cx-add-to-cart')
    .getAllByText(/Add To Cart/i)
    .first()
    .click({ force: true });
}

export function closeAddedToCartDialog() {
  cy.get('cx-added-to-cart-dialog [aria-label="Close"]').click({ force: true });
}

export function checkProductInCart(product, qty = 1) {
  return getCartItem(product.name).within(() => {
    cy.get('.cx-price>.cx-value').should('contain', formatPrice(product.price));
    cy.get('.cx-counter-value').should('have.value', `${qty}`);
    cy.get('.cx-total>.cx-value').should(
      'contain',
      formatPrice(qty * product.price)
    );
    cy.root();
  });
}

export function checkAddedToCartDialog(itemsNumber = 1) {
  cy.get('cx-added-to-cart-dialog .cx-dialog-total').should(
    'contain',
    `Cart total (${itemsNumber} item${itemsNumber > 1 ? 's' : ''})`
  );
}

export function addProductToCartViaAutoComplete(mobile: boolean) {
  const product = products[0];
  goToFirstProductFromSearch(product.code, mobile);
  addToCart();
  closeAddedToCartDialog();
  checkMiniCartCount(1).click({ force: true });
  checkProductInCart(product);
}

export function addProductToCartViaSearchPage(mobile: boolean) {
  const product = products[1];

  goToFirstProductFromSearch(product.type, mobile);

  addToCart();

  closeAddedToCartDialog();

  checkMiniCartCount(2).click({ force: true });

  checkProductInCart(product);
}

export function removeAllItemsFromCart() {
  const product0 = products[0];
  const product1 = products[1];
  cy.server();
  cy.route(
    'GET',
    `${apiUrl}/rest/v2/electronics-spa/users/anonymous/carts/*?fields=*&lang=en&curr=USD`
  ).as('refresh_cart');

  getCartItem(product0.name).within(() => {
    cy.getByText('Remove').click();
  });

  cy.wait('@refresh_cart');

  getCartItem(product1.name).within(() => {
    cy.getByText('Remove').click();
  });

  validateEmptyCart();
}

export function removeCartItem(product) {
  getCartItem(product.name).within(() => {
    cy.getByText('Remove').click();
  });
}

export function loginRegisteredUser() {
  standardUser.registrationData.email = generateMail(randomString(), true);
  // Hack to make it more stable
  // cy.requireLoggedIn works thanks to rehydration.
  // Unfortunately it is not always stable. Sometimes app could override localStorage data.
  // Issue for proper fix: #4671
  cy.wait(2000);
  cy.requireLoggedIn(standardUser);
  cy.reload();
}

export function addProductWhenLoggedIn(mobile: boolean) {
  const product = products[1];

  goToFirstProductFromSearch(product.code, mobile);
  addToCart();
  checkAddedToCartDialog();
  closeAddedToCartDialog();
}

export function logOutAndNavigateToEmptyCart() {
  cy.selectUserMenuOption({
    option: 'Sign Out',
  });
  cy.get('cx-login [role="link"]').should('contain', 'Sign In');

  cy.visit('/cart');
  validateEmptyCart();
}

export function addProductAsAnonymous() {
  const product = products[2];

  cy.get('cx-searchbox input').type(`${product.code}{enter}`, {
    force: true,
  });
  cy.get('cx-product-list')
    .contains('cx-product-list-item', product.name)
    .within(() => {
      addToCart();
    });

  checkAddedToCartDialog();
  closeAddedToCartDialog();
}

export function verifyCartNotEmpty() {
  cy.get('cx-mini-cart .count').contains('1');
}

export function verifyMergedCartWhenLoggedIn() {
  const product0 = products[1];
  const product1 = products[2];

  cy.get('cx-login [role="link"]').click();
  login(
    standardUser.registrationData.email,
    standardUser.registrationData.password
  );

  cy.get('cx-breadcrumb h1').should('contain', '1 result');

  checkMiniCartCount(2).click({ force: true });

  cy.get('cx-breadcrumb h1').should('contain', 'Your Shopping Cart');

  checkProductInCart(product0);
  checkProductInCart(product1);
}

export function logOutAndEmptyCart() {
  cy.selectUserMenuOption({
    option: 'Sign Out',
  });
  cy.visit('/cart');
  validateEmptyCart();
}

export function manipulateCartQuantity() {
  const product = products[1];

  cy.visit(`/product/${product.code}`);
  addToCart();
  checkAddedToCartDialog();
  closeAddedToCartDialog();

  checkMiniCartCount(1).click({ force: true });

  checkProductInCart(product, 1).within(() => {
    incrementQuantity();
  });

  checkCartSummary('$208.24');

  checkProductInCart(product, 2).within(() => {
    incrementQuantity();
  });

  checkCartSummary('$322.36');

  checkProductInCart(product, 3);
}

export function outOfStock() {
  const product = products[3];

  cy.visit(`/product/${product.code}`);

  cy.get('cx-add-to-cart .quantity').should('contain', 'Out of stock');
  cy.get('cx-add-to-cart cx-add-to-cart button').should('not.exist');
}

export const cartUser = {
  user: 'standard',
  registrationData: {
    firstName: 'Winston',
    lastName: 'Rumfoord',
    password: 'Password123.',
    titleCode: 'mr',
    email: generateMail(randomString(), true),
  },
};

export function registerCartUser() {
  cy.visit('/login/register');
  register({ ...cartUser.registrationData });
  cy.url().should('not.contain', 'register');
}

export function loginCartUser() {
  cy.visit('/login');
  login(cartUser.registrationData.email, cartUser.registrationData.password);
  cy.url().should('not.contain', 'login');
}
