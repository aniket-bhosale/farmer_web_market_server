"use strict";

/**
 * basket controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::basket.basket", ({ strapi }) => ({

  async find(ctx) {
    
    // console.log({ctx.state.user});
    const { email } = ctx.state.user;
    try {
      const data = await strapi.db.query("api::basket.basket").findMany({
        where: { userEmail: email },
      });
      return { data };
    } catch (error) {
      ctx.response.status = 500;
      return error;
    }
  },
  async create(ctx) {
    const { email } = ctx.state.user;
    try {
      const res = await strapi.service("api::basket.basket").create({
        data: {
          userEmail: email,
          ...ctx.request.body.data,
        },
      });
      return res;
    } catch (error) {
      ctx.response.status = 500;
      return error;
    }
  },
  async delete(ctx) {
    const { email } = ctx.state.user;
    const { id } = ctx.params;
    try {
      if (id === "fakeId") {
        const res = await strapi.db.query("api::basket.basket").deleteMany({
          where: { userEmail: email },
        });
        return res;
      }
      const res = await strapi.db.query("api::basket.basket").delete({
        where: { id },
      });
      return res;
    } catch (error) {
      ctx.response.status = 500;
      console.log({ error });
      return error;
    }
  },
}));