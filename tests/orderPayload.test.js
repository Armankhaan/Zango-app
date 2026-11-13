import test from 'node:test';
import assert from 'node:assert/strict';
import { dealSelectionCodes, serializeAppCart, appOrderInfo } from '../src/utils/orderPayload.js';
import { isWithinStoreHours, isCompanyBranch } from '../src/utils/store.js';

test('deal picks the fixed size/crust reference before the generic product reference', () => {
  assert.deepEqual(dealSelectionCodes({ product: { ref_code: 'PARENT' }, variant_items: [{ ref_code: '10371', pos_code: 'LARGE-PAN', price: 1500 }] }), { pos_code: 'LARGE-PAN', ref_code: '10371' });
  assert.deepEqual(dealSelectionCodes({ product: { ref_code: '10362' }, variant_items: [] }), { pos_code: null, ref_code: '10362' });
});

test('clean deal JSON keeps included references and positive extras without charging twice', () => {
  const cart = { 'deal-70-key': { name: 'Large deal', price: 2350, quantity: 2, image: 'image-not-for-order', details: {
    id: 70, pos_code: '10440', basePrice: 2199,
    slots: { 155: { id: 8865, name: 'Cheesy Line LARGE PAN', ref_code: '10371', price: 100,
      variant_items: [{ id: 1419, name: 'PAN', ref_code: '10371' }],
      selected_toppings: [{ id: 99, name: 'Cheese', ref_code: 'TOP', price: 51, quantity: 2 }] } },
  } } };
  const info = appOrderInfo({ cart, branch: { delivery_charges: 80 }, customerInfo: { name: 'Test', access_token: 'must-not-leak' } });
  assert.equal(info.subtotal, 4700);
  assert.equal(info.grand_total, 4780);
  assert.equal(info.source, 'zango');
  const deal = info.cart['deal-70-key'];
  assert.equal(deal.details.extraPrice, 151);
  assert.equal(deal.details.slots[155].extra_price, 100);
  assert.equal(deal.details.slots[155].variant_items[0].ref_code, '10371');
  assert.equal(deal.details.slots[155].customizations[0].ref_code, 'TOP');
  assert.equal(JSON.stringify(info).includes('must-not-leak'), false);
  assert.equal(JSON.stringify(info).includes('image-not-for-order'), false);
});

test('half pizza fractions and removed default toppings retain their meaning', () => {
  const half = { pizza: { item_id: 1, item_name: 'Pizza', quantity: 0.5, ref_code: 'PIZZA' }, crust: { item_id: 2, item_name: 'PAN', quantity: 0.5, ref_code: 'CRUST' }, toppings: [{ id: 3, name: 'Remove olives', quantity: -1, price: 0, ref_code: 'OLIVE' }] };
  const result = serializeAppCart({ '500-test': { name: 'Half pizza', price: 1200, quantity: 1, details: { id: 500, firstHalf: half, secondHalf: half } } });
  assert.equal(result['500-test'].details.firstHalf.pizza.quantity, 0.5);
  assert.equal(result['500-test'].details.firstHalf.toppings[0].quantity, -1);
  assert.equal(result['500-test'].details.secondHalf.crust.ref_code, 'CRUST');
});

test('pick-up ignores delivery fees and keeps financial fields numeric', () => {
  const info = appOrderInfo({cart:{a:{name:'Burger',price:'499.50',quantity:2,details:{ref_code:'10362'}}},orderType:'Pick-Up',branch:{delivery_charges:130}});
  assert.equal(info.delivery_fee, 0);
  assert.equal(info.grand_total, 999);
  assert.equal(info.cart.a.details.ref_code, '10362');
});

test('company validation and Pakistan overnight store hours reject stale/wrong selections', () => {
  const branch = { id: 39, company_id: '10', day_start_time: '10:00:00', day_end_time: '04:00:00' };
  assert.equal(isCompanyBranch(branch, 10), true);
  assert.equal(isCompanyBranch({ ...branch, company_id: 2 }, 10), false);
  assert.equal(isWithinStoreHours(branch, new Date('2026-11-13T22:00:00Z')), true);
  assert.equal(isWithinStoreHours(branch, new Date('2026-11-13T23:00:00Z')), false);
});
