const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const positive = value => Math.max(0, number(value));
const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
const firstCode = (...values) => { const value = values.find(item => item !== null && item !== undefined && String(item).trim() !== ''); return value === undefined ? null : String(value).trim(); };
export function itemCodes(item) {
  return { pos_code: firstCode(item?.pos_code, item?.poscode), ref_code: firstCode(item?.ref_code, item?.refcode) };
}
export function dealSelectionCodes(item) {
  const direct = itemCodes(item);
  const fixed = (item?.variant_items || []).map(itemCodes);
  const product = itemCodes(item?.product);
  return {pos_code:firstCode(direct.pos_code,...fixed.map(item=>item.pos_code),product.pos_code),ref_code:firstCode(direct.ref_code,...fixed.map(item=>item.ref_code),product.ref_code)};
}
function selection(item) {
  return { ...(item.variant_id !== undefined ? {variant_id:item.variant_id} : {}), ...(item.option_id !== undefined ? {option_id:item.option_id} : {}), id:item.id ?? item.item_id, name:item.name || item.item_name || '', price:positive(item.price), quantity:item.quantity === undefined ? 1 : number(item.quantity), ...itemCodes(item) };
}
function half(item) {
  if (!item) return null;
  return { pizza:item.pizza ? selection(item.pizza) : null, crust:item.crust ? selection(item.crust) : null, toppings:(item.toppings || item.customizations || item.selected_toppings || []).map(selection) };
}
export function serializeAppCart(cart) {
  return Object.fromEntries(Object.entries(cart).map(([key,item])=>{
    const details=item.details || {};
    let clean;
    if (details.slots) {
      clean={ id:details.id, ...itemCodes(details), basePrice:positive(details.basePrice), extraPrice:round(Math.max(0,positive(item.price)-positive(details.basePrice))), unitPrice:positive(item.price), quantity:item.quantity,
        slots:Object.fromEntries(Object.entries(details.slots).map(([slotId,slot])=>[slotId,{
          id:slot.id,name:slot.name || '',...itemCodes(slot),extra_price:positive(slot.extra_price ?? slot.price),
          variant_items:(slot.variant_items || []).map(variant=>({id:variant.id,name:variant.name,...itemCodes(variant)})),
          ...(slot.crust ? {crust:selection(slot.crust)} : {}),
          customizations:(slot.selected_toppings || slot.customizations || []).map(selection),
          ...(slot.firstHalf ? {firstHalf:half(slot.firstHalf)} : {}),...(slot.secondHalf ? {secondHalf:half(slot.secondHalf)} : {}),
        }]))};
    } else {
      const codes=itemCodes(details.size || details);
      const outer=itemCodes(item);
      clean={id:details.id ?? (Number.parseInt(key,10)||null),name:item.name,price:positive(details.size?.price ?? details.price ?? item.price),pos_code:firstCode(codes.pos_code,outer.pos_code),ref_code:firstCode(codes.ref_code,outer.ref_code),
        selected_toppings:(details.customizations || details.selected_toppings || []).map(selection),
        ...(details.firstHalf ? {firstHalf:half(details.firstHalf)} : {}),...(details.secondHalf ? {secondHalf:half(details.secondHalf)} : {}),};
    }
    // App prices already include the selected upcharges; never add them a second time.
    return [key,{key,name:item.name,price:positive(item.price),quantity:Math.max(1,number(item.quantity)),details:clean}];
  }));
}
function orderStoreCode(branch) {
  const value = [branch?.legacy_code, branch?.store_code, branch?.branch_code]
    .find(code => code !== null && code !== undefined && String(code).trim() !== '');
  if (value === undefined) throw new Error('Store code is missing for the selected branch. Please select your branch again.');
  return String(value).trim();
}

export function appOrderInfo({cart,orderType='Delivery',paymentMethod='Cash',customerInfo={},branch,instructions=''}) {
 const subtotal=round(Object.values(cart).reduce((sum,item)=>sum+positive(item.price)*Math.max(1,number(item.quantity)),0));
 const fee=orderType==='Delivery'?positive(branch?.delivery_charges):0;
 return {cart:serializeAppCart(cart),orderType,paymentMethod,customerInfo:{name:customerInfo.name || customerInfo.first_name || '',phone:customerInfo.phone || '',email:customerInfo.email || '',address:customerInfo.address || '',latitude:customerInfo.latitude ?? null,longitude:customerInfo.longitude ?? null},instructions,subtotal,delivery_fee:fee,grand_total:round(subtotal+fee),source:'zango-app',store_code:orderStoreCode(branch)};
}
