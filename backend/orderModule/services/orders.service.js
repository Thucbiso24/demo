"use strict";

const DbMixin = require("../mixins/db.mixin");
const { MoleculerError } = require("moleculer").Errors;

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "orders",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("orders")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: ["_id", "productId", "quantity"],
	},

	/**
	 * Action Hooks
	 */
	hooks: {
		before: {
			/**
			 * Register a before hook for the `create` action.
			 * It sets a default value for the quantity field.
			 *
			 * @param {Context} ctx
			 */
		},
	},

	/**
	 * Actions
	 */
	actions: {
		create: {
			rest: "POST /",
			params: {
				productId: "string",
				quantity: "number",
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				console.log(ctx.params);
				const product = await ctx.call(
					"products.get",
					{ id: ctx.params.productId },
					{ nodeID: "productModule" }
				);
				if (!product) {
					throw new MoleculerError(
						"Product not found",
						404,
						"ERR_NOT_FOUND_PRODUCT"
					);
				}
				if (ctx.params.quantity > product.quantity) {
					throw new MoleculerError(
						"Quantity exceeds the allowable value",
						404,
						"ERR_QUANTITY_EXCEEDS_THE_ALLOWABLE_VALUE"
					);
				}
				const doc = await this.adapter.insert({
					productId: ctx.params.productId,
					quantity: ctx.params.quantity,
				});
				const json = await this.transformDocuments(
					ctx,
					ctx.params,
					doc
				);
				await this.entityChanged("updated", json, ctx);

				return json;
			},
		},
		list: {},
	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {},
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	},
};
