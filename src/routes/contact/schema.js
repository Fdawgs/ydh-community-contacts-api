const S = require("fluent-json-schema");

const tags = ["Community Contacts"];

const dateTimeSearchPattern =
	/^(?:eq|ne|ge|le|gt|lt|sa|eb|ap|)\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}|)(?:.\d{3}|)(?:Z|)$/im;

const dateTimeSearchPatternExamples = [
	"2022-01-13",
	"2022-01-13T00:00:01",
	"2022-01-13T00:00:01.001",
	"2022-01-13T00:00:01Z",
	"2022-01-13T00:00:01.001Z",
	"ge2022-01-13T00:00:01",
	"ge2022-01-13",
];

const phoneNumberPattern = /^\+?(?:\d\s?){10,12}$/im;

const phoneNumberPatternExamples = [
	"+44 1935 475122",
	"+441935475122",
	"+441935 475122",
	"01935 475122",
	"01935475122",
];

const contactBaseSchema = S.object()
	.prop("id", S.string().format("uuid"))
	.prop(
		"match",
		S.object()
			.additionalProperties(false)
			.prop(
				"type",
				S.string().examples(["gp_id", "postcode", "school_code"])
			)
			.prop("value", S.string().examples(["TA126JU"]))
			.prop("receiver", S.string().examples(["Area North"]))
			.required(["type", "value", "receiver"])
	)
	.prop(
		"telecom",
		S.array()
			.items(
				S.object()
					.additionalProperties(false)
					.prop(
						"system",
						S.string().enum([
							"email",
							"fax",
							"pager",
							"phone",
							"url",
						])
					)
					.prop(
						"value",
						S.anyOf([
							S.string().format("email"),
							S.string().format("url"),
							S.string()
								.examples(phoneNumberPatternExamples)
								.pattern(phoneNumberPattern),
						])
					)
					.prop(
						"use",
						S.string().examples([
							"Community Midwives",
							"Health Visitors",
						])
					)
					.required(["system", "value", "use"])
			)
			.uniqueItems(true)
	)
	.prop(
		"meta",
		S.object()
			.additionalProperties(false)
			.prop(
				"created",
				S.string()
					.examples(["2022-01-13T14:05:54.000Z"])
					.format("date-time")
			)
			.prop(
				"last_updated",
				S.string()
					.examples(["2022-01-13T14:05:54.000Z"])
					.format("date-time")
			)
	)
	.required(["match", "telecom"]);

/**
 * Fastify uses AJV for JSON Schema Validation,
 * see https://www.fastify.io/docs/latest/Validation-and-Serialization/
 *
 * Input validation protects against XSS, HPP, and most injection attacks.
 */
const contactDeleteSchema = {
	tags,
	summary: "Delete community contact",
	description: "Delete a community contact record.",
	operationId: "deleteContact",
	produces: ["application/json", "application/xml"],
	params: S.object()
		.prop(
			"id",
			S.string()
				.description("Unique identifier of community contact record")
				.examples(["A972C577-DFB0-064E-1189-0154C99310DAAC12"])
				.format("uuid")
		)
		.required(["id"]),
	response: {
		204: S.string().raw({ nullable: true }).description("No Content"),
		401: S.ref("responses#/definitions/unauthorized").description(
			"Unauthorized"
		),
		404: S.ref("responses#/definitions/notFoundDbResults").description(
			"Not Found"
		),
		406: S.ref("responses#/definitions/notAcceptable").description(
			"Not Acceptable"
		),
		429: S.ref("responses#/definitions/tooManyRequests").description(
			"Too Many Requests"
		),
		500: S.ref("responses#/definitions/internalServerError").description(
			"Internal Server Error"
		),
		503: S.ref("responses#/definitions/serviceUnavailable").description(
			"Service Unavailable"
		),
	},
};

const contactGetReadSchema = {
	tags,
	summary: "Read community contact",
	description: "Return a single community contact record.",
	operationId: "getReadContact",
	produces: ["application/json", "application/xml"],
	params: S.object()
		.prop(
			"id",
			S.string()
				.description("Unique identifier of community contact record")
				.examples(["A972C577-DFB0-064E-1189-0154C99310DAAC12"])
				.format("uuid")
		)
		.required(["id"]),
	response: {
		200: contactBaseSchema,
		401: S.ref("responses#/definitions/unauthorized").description(
			"Unauthorized"
		),
		404: S.ref("responses#/definitions/notFoundDbResults").description(
			"Not Found"
		),
		406: S.ref("responses#/definitions/notAcceptable").description(
			"Not Acceptable"
		),
		429: S.ref("responses#/definitions/tooManyRequests").description(
			"Too Many Requests"
		),
		500: S.ref("responses#/definitions/internalServerError").description(
			"Internal Server Error"
		),
		503: S.ref("responses#/definitions/serviceUnavailable").description(
			"Service Unavailable"
		),
	},
};

const contactGetSearchSchema = {
	tags,
	summary: "Search community contacts",
	description: "Return community contact records.",
	operationId: "getSearchContact",
	produces: ["application/json", "application/xml"],
	query: S.object()
		.prop(
			"match.type",
			S.string()
				.description("Type of matching value")
				.examples(["gp_id", "postcode", "school_code"])
		)
		.prop(
			"match.value",
			S.string()
				.description(
					"Matching value, case-insensitive and supports `*` wildcards"
				)
				.examples(["BA229RZ", "BA2*", "BA22*"])
		)
		.prop(
			"match.receiver",
			S.string()
				.description("Receiving organisation or area")
				.examples(["Sherborne", "Springmead Surgery, Chard"])
		)
		.prop(
			"telecom.value",
			S.anyOf([
				S.string().format("email"),
				S.string().format("url"),
				S.string()
					.examples(phoneNumberPatternExamples)
					.pattern(phoneNumberPattern),
			])
		)
		.prop(
			"meta.created",
			S.anyOf([
				S.string()
					.description(
						"Datetime when community contact record was created"
					)
					.examples(dateTimeSearchPatternExamples)
					.pattern(dateTimeSearchPattern),
				S.array()
					.items(
						S.string()
							.description(
								"Datetime when community contact record was created"
							)
							.examples(dateTimeSearchPatternExamples)
							.pattern(dateTimeSearchPattern)
					)
					.minItems(2)
					.maxItems(2)
					.uniqueItems(true),
			])
		)
		.prop(
			"meta.last_updated",
			S.anyOf([
				S.string()
					.description(
						"Last modified datetime of community contact record"
					)
					.examples(dateTimeSearchPatternExamples)
					.pattern(dateTimeSearchPattern),
				S.array()
					.items(
						S.string()
							.description(
								"Last modified datetime of community contact record"
							)
							.examples(dateTimeSearchPatternExamples)
							.pattern(dateTimeSearchPattern)
					)
					.minItems(2)
					.maxItems(2)
					.uniqueItems(true),
			])
		)
		.prop(
			"page",
			S.number()
				.description("Page to retrieve")
				.default(1)
				.examples([1, 10])
				.minimum(1)
		)
		.prop(
			"per_page",
			S.number()
				.description(
					"Number of community contact records to return per page"
				)
				.default(1)
				.examples([1, 10])
				.minimum(1)
				.maximum(100)
		),
	responses: {
		200: S.object()
			.additionalProperties(false)
			.prop("link", S.string().format("uri"))
			.prop(
				"entry",
				S.array().items(
					S.object()
						.prop("url", S.string().format("uri"))
						.extend(contactBaseSchema)
				)
			)
			.prop(
				"meta",
				S.object()
					.additionalProperties(false)
					.prop(
						"pagination",
						S.object()
							.additionalProperties(false)
							.prop("total", S.number().examples([0, 1, 10]))
							.prop(
								"per_page",
								S.number()
									.default(1)
									.examples([1, 10])
									.minimum(1)
									.maximum(100)
							)
							.prop(
								"current_page",
								S.number()
									.default(1)
									.examples([1, 10])
									.minimum(1)
							)
							.prop("total_pages", S.number().examples([1, 10]))
					)
			),
		400: S.ref("responses#/definitions/badRequest").description(
			"Bad Request"
		),
		401: S.ref("responses#/definitions/unauthorized").description(
			"Unauthorized"
		),
		404: S.ref("responses#/definitions/notFoundDbResults").description(
			"Not Found"
		),
		406: S.ref("responses#/definitions/notAcceptable").description(
			"Not Acceptable"
		),
		429: S.ref("responses#/definitions/tooManyRequests").description(
			"Too Many Requests"
		),
		500: S.ref("responses#/definitions/internalServerError").description(
			"Internal Server Error"
		),
		503: S.ref("responses#/definitions/serviceUnavailable").description(
			"Service Unavailable"
		),
	},
};

const contactPostSchema = {
	tags,
	summary: "Add community contact",
	description: "Add a new community contact record.",
	operationId: "postContact",
	consumes: ["application/json"],
	produces: ["application/json", "application/xml"],
	body: contactBaseSchema
		.additionalProperties(false)
		.only(["match", "telecom"]),
	response: {
		201: S.object().prop(
			"id",
			S.string()
				.description(
					"Unique identifier of newly created community contact record"
				)
				.examples(["A972C577-DFB0-064E-1189-0154C99310DAAC12"])
				.format("uuid")
		),
		401: S.ref("responses#/definitions/unauthorized").description(
			"Unauthorized"
		),
		406: S.ref("responses#/definitions/notAcceptable").description(
			"Not Acceptable"
		),
		415: S.ref("responses#/definitions/unsupportedMediaType").description(
			"Unsupported Media Type"
		),
		429: S.ref("responses#/definitions/tooManyRequests").description(
			"Too Many Requests"
		),
		500: S.ref("responses#/definitions/internalServerError").description(
			"Internal Server Error"
		),
		503: S.ref("responses#/definitions/serviceUnavailable").description(
			"Service Unavailable"
		),
	},
};

const contactPutSchema = {
	tags,
	summary: "Update community contact",
	description: "Update an existing community contact record.",
	operationId: "putContact",
	consumes: ["application/json"],
	produces: ["application/json", "application/xml"],
	params: S.object()
		.prop(
			"id",
			S.string()
				.description("Unique identifier of community contact record")
				.examples(["A972C577-DFB0-064E-1189-0154C99310DAAC12"])
				.format("uuid")
		)
		.required(["id"]),
	body: contactBaseSchema
		.additionalProperties(false)
		.only(["match", "telecom"]),
	response: {
		204: S.string().raw({ nullable: true }).description("No Content"),
		401: S.ref("responses#/definitions/unauthorized").description(
			"Unauthorized"
		),
		404: S.ref("responses#/definitions/notFoundDbResults").description(
			"Not Found"
		),
		406: S.ref("responses#/definitions/notAcceptable").description(
			"Not Acceptable"
		),
		415: S.ref("responses#/definitions/unsupportedMediaType").description(
			"Unsupported Media Type"
		),
		429: S.ref("responses#/definitions/tooManyRequests").description(
			"Too Many Requests"
		),
		500: S.ref("responses#/definitions/internalServerError").description(
			"Internal Server Error"
		),
		503: S.ref("responses#/definitions/serviceUnavailable").description(
			"Service Unavailable"
		),
	},
};

module.exports = {
	contactDeleteSchema,
	contactGetReadSchema,
	contactGetSearchSchema,
	contactPostSchema,
	contactPutSchema,
};
