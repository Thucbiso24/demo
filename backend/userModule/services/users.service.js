"use strict";

const DbMixin = require("../mixins/db.mixin");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const { MoleculerError } = require("moleculer").Errors;

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "users",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("users")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: ["_id", "name", "email", "isAdmin"],
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
			create(ctx) {
				ctx.params.quantity = 0;
			},
		},
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * The "moleculer-db" mixin registers the following actions:
		 *  - list
		 *  - find
		 *  - count
		 *  - create
		 *  - insert
		 *  - update
		 *  - remove
		 */

		// --- ADDITIONAL ACTIONS ---

		/**
		 * Increase the quantity of the product item.
		 */

		verify: {
			rest: "POST /verify",
			params: {
				email: "string",
				password: "string",
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const doc = await this.adapter.findOne({
					email: ctx.params.email,
				});
				if (!doc) {
					throw new MoleculerError(
						"Email not found",
						404,
						"ERR_NOT_FOUND_EMAIL"
					);
				}
				const isCorrectPassword = bcrypt.compareSync(
					ctx.params.password,
					doc.password
				);
				if (!isCorrectPassword) {
					throw new MoleculerError(
						"Incorrect password",
						404,
						"ERR_INCORRECT_PASSWORD"
					);
				}
				const json = await this.transformDocuments(
					ctx,
					ctx.params,
					doc
				);

				return json;
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
			const password = bcrypt.hashSync("Biso24@2022", salt);
			await this.adapter.insertMany([
				{
					name: "admin",
					email: "app@biso24.com",
					password,
					type: "admin",
					createdAt: Date.now(),
				},
				{
					name: "Lê Trần Trung Đức",
					email: "pikachu1@biso24.com",
					password,
					type: "admin",
					createdAt: Date.now(),
				},
				{
					name: "Trần Hưng Thịnh",
					email: "pikachu2@biso24.com",
					password,
					type: "admin",
					createdAt: Date.now(),
				},
				{
					name: "Đặng Anh Dũng",
					email: "pikachu3@biso24.com",
					password,
					type: "admin",
					createdAt: Date.now(),
				},
				{
					name: "Huỳnh Trọng Nghĩa",
					email: "pikachu4@biso24.com",
					password,
					type: "admin",
					createdAt: Date.now(),
				},
				{
					name: "Vũ Gia Khiêm",
					email: "pikachu5@biso24.com",
					password,
					type: "admin",
					createdAt: Date.now(),
				},
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
