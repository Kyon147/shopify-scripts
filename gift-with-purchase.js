(function($){

  /** 
 * Here is where you can enter different products and the qty.
 * When a product is on teh checkout that matches here, it will add the
 * gift item automatically.
 **/

  var giftRules = [
    //Place your gift rules inside the [] brackets.

    /**Example rule - use this as a template to create others**/
    {
      trigger : 31554464710720, //Must be the variant_id not the product_id
      triggerQty: 1,
      gift: 22437842976832, //Must be the variant_id not the product_id
      giftQty: 1
    },

    //End of giftrules. Don't place anything beyond here.
  ]
  /** 
 * This is where you need to add your cart item class and the class which has the
 * Qty value. You can also change the free gift message.
 * There needs to be a data attribute for variant ID value on cart item too.
 **/
  var selectors = {
    elements: {
      cartItem: 'tr.cart__row',
      qtyVal: '.cart__qty-input',
    },
    data: {
      productVariant: 'variant-id' // must be attached to the same div as the CartItem.
    },
    translation: {
      message: 'Enjoy your free gift'
    }

  }

  /** 
 * DO NOT MODIFY ANY CODE BEYOND HERE OR YOU COULD BREAK THE TOOL AND THE SITE.
 * 
 * YOU HAVE BEEN WARNED.
 *
 **/


  var gift = {

    giftsToAdd: {},
    basketItems:[],
    checkForGifts: function(){
      //console.log('cart ready');
      //console.log(giftRules);
      var cartItems = $(selectors.elements.cartItem);
      cartItems.each(function(i,v){

        var item = $(v);
        var variantID = item.data(selectors.data.productVariant);
        var itemQty = parseInt( item.find(selectors.elements.qtyVal).val() );

        gift.basketItems.push(variantID);
        //console.log('item qty is: ' + itemQty);

        let obj = giftRules.find(o => o.trigger === variantID);
        let hasGift = giftRules.find(o => o.gift === variantID);

        //console.log(obj);

        //If there is a giftable item then add it to the array.
        if(obj){
          if(obj.triggerQty === itemQty){
            gift.giftsToAdd[obj.gift] = obj;
            //console.log('Has item & correct qty...adding.');
          }
        }

        if(hasGift){

          item.attr('data-gift-item','');
          //console.log('has gift already to remove it from gifts to add.');   
          var giftId = hasGift.gift;
          delete gift.giftsToAdd[giftId]; 

        }


      });
      //console.log("giftsToAdd");
      //console.log(this.giftsToAdd);
    },
    sortGifts: function(giftsToAdd){

      //console.log('Sorting Gifts');

      if(typeof this.giftsToAdd === 'Object' && this.giftsToAdd !== null){

        //console.log('Not Object or Empty.... Quitting.');
        return;

      }

      //Check one last time that there are no gifts added.
      var cartItems = $(selectors.elements.cartItem);
      cartItems.each(function(i,v){

        var item = $(v);
        var variantID = item.data(selectors.data.productVariant);
        let hasGift = giftRules.find(o => o.gift === variantID);
        let obj = giftRules.find(o => o.trigger === variantID);

        if(hasGift){

          //console.log('Has gift at last check. Removing.');
          var giftId = hasGift.gift;
          delete gift.giftsToAdd[giftId]; 
          //console.log(gift.giftsToAdd);

          var triggerId = hasGift.trigger;
          //console.log(triggerId);
          //console.log(gift.basketItems);
          let cartItem = $('[data-variant-id="'+ hasGift.trigger +'"]');
          let cartItemQty = cartItem.find(selectors.elements.qtyVal).val();
          //console.log(cartItemQty);

          if(!gift.basketItems.includes(triggerId)){
            //console.log('hasGift but does not have trigger item.');
            gift.removeGift(giftId);
          } else if (cartItemQty < hasGift.triggerQty) {
            //console.log('hasGift but does not have trigger QTY.');
            gift.removeGift(giftId);
          }

        }


      });

      if(Object.keys(gift.giftsToAdd).length > 0){
        //console.log('Add Gifts');
        Object.keys(gift.giftsToAdd).forEach(function(k,i){
          var item = gift.giftsToAdd[k];
          gift.addGift(item.gift, item.giftQty, { 'Free Gift' : selectors.translation.message });
        });

      }


    },
    addGift: function(variantId, qty, properties){

      $.post('/cart/add.js', {
        items: [{
          quantity: qty,
          id: variantId,
          properties: (properties) ? properties : ''
        }]
      }).done((res) => {
        //console.log(res);
        window.location.reload();
      });

    },
    removeGift: function(variantID){

      $.post('/cart/change.js', { 
        quantity: 0, 
        id: variantID 
      }).done((res) => {
        //console.log(res);
        window.location.reload();
      });

    },
    init:function(){
      //console.log('Gift INIT');
      this.basketItems = [];
      this.checkForGifts();
      this.sortGifts(gift.giftsToAdd);

    }

  }


  $(document).ready(function(){

    gift.init();

  });

})(jQuery)
