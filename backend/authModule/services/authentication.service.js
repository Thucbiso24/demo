"use strict";

const jwt = require("jsonwebtoken");
const fs = require("fs");
const mongodb = require("mongodb");

const privateKey = fs.readFileSync("./jwtRS256.key");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "auth",
	// version: 1

	/**
	 * Actions
	 */
	actions: {
		/**
		// --- ADDITIONAL ACTIONS ---

		/**
		 * Increase the quantity of the product item.
		 */

		login: {
			rest: "POST /login",
			params: {
				email: "string",
				password: "string",
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const user = await ctx.call(
					"users.verify",
					{ email: ctx.params.email, password: ctx.params.password },
					{ nodeID: "userModule" }
				);
				const jti = mongodb.ObjectId();
				const accessToken = jwt.sign(
					{ iss: "Biso24", sub: user._id, jti },
					privateKey,
					{
						algorithm: "RS256",
						expiresIn: "1h",
					}
				);
				const refreshToken = jwt.sign(
					{ iss: "Biso24", jti },
					privateKey,
					{
						algorithm: "RS256",
						expiresIn: "1h",
					}
				);
				return {
					accessToken,
					refreshToken,
				};
			},
		},
		increaseQuantity: {
			rest: "PUT /:id/quantity/increase",
			params: {
				id: "string",
				value: "number|integer|positive",
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const doc = await this.adapter.updateById(ctx.params.id, {
					$inc: { quantity: ctx.params.value },
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

		/**
		 * Decrease the quantity of the product item.
		 */
		decreaseQuantity: {
			rest: "PUT /:id/quantity/decrease",
			params: {
				id: "string",
				value: "number|integer|positive",
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				const doc = await this.adapter.updateById(ctx.params.id, {
					$inc: { quantity: -ctx.params.value },
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
		async seedDB() {
			await this.adapter.insertMany([
				{ name: "Samsung Galaxy S10 Plus1", quantity: 10, price: 704 },
				{ name: "iPhone 11 Pro", quantity: 25, price: 999 },
				{ name: "Huawei P30 Pro", quantity: 15, price: 679 },
			]);
		},
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	},
};
