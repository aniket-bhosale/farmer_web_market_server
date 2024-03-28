"use strict";



const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = "http://localhost:3000/basket";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// import { DefaultContext, StrapiCtx } from 'strapi';

module.exports = createCoreController("api::order.order", ({ strapi }) => ({

  async create(ctx) {

    
    const { orders } = ctx.request.body;
    let email;



    // Check if userEmail is available in the order data
    if (orders && orders.length > 0 && orders[0].userEmail) {
      email = orders[0].userEmail;
    } else {
      // If userEmail is not available in order data, try to get it from ctx.state?.user
      email = ctx.state?.user?.email;
    }
    
    console.log("Email:", email);

    try {
      const productsList = await Promise.all(
        orders.map(async (order) => {
          const product = await strapi
            .service("api::product.product")
            .findOne(order.productId);

            const image = order.image;

          return {
            price_data: {
              currency: "GBP",
              product_data: {
                name: product.name,
                images:[image]
              },
              unit_amount: Math.round(product.price * 100),
            },
            quantity: order.quantity,
            
          };
        })
      );

      const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {
          allowed_countries: ["GB"],
        },
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${YOUR_DOMAIN}?success=true`,
        cancel_url: `${YOUR_DOMAIN}?cancel=true`,
        line_items: productsList,
      });

      await strapi
        .service("api::order.order")
        .create({ data: { orders, email, stripeId: session.id } });

      return { stripeSession: session };
    } catch (error) {
      ctx.response.status = 500;
      return { error };
    }
  },
  async find(ctx) {
    const { orders } = ctx.request.body;
    let email;

    // Check if userEmail is available in the order data
    if (orders && orders.length > 0 && orders[0].userEmail) {
      email = orders[0].userEmail;
    } else {
      // If userEmail is not available in order data, try to get it from ctx.state?.user
      email = ctx.state?.user?.email;
    }


    console.log(email);


    try {
      const data = await strapi.db.query("api::order.order").findMany({
        where: { email },
      });
      return { data };
    } catch (error) {
      ctx.response.status = 500;
      return error;
    }
  },
}));