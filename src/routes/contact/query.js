/**
 * @author Frazer Smith
 * @description Build SQL query string.
 * @param {object} options - Query string and database config values.
 * @param {string} options.id - Logical id of the artifact.
 * @returns {string} Query string.
 */
const contactDelete = ({ id }) => `DELETE
 FROM lookup.contacts
 WHERE id = '${id}';`;

/**
 * @author Frazer Smith
 * @description Build SQL query string.
 * @param {object} options - Query string and database config values.
 * @param {string} options.id - Logical id of the artifact.
 * @returns {string} Query string.
 */
const contactGetRead = ({ id }) => `SELECT
    id,
    match_type,
    match_value,
    match_receiver,
    telecom,
    created,
    last_updated
FROM lookup.contacts
WHERE id = '${id}';`;

/**
 * @author Frazer Smith
 * @description Build SQL query string.
 * @param {object} options - Query string and database config values.
 * @param {('mssql'|'postgresql')} options.client - Database client.
 * @param {string} options.whereClausePredicates - WHERE clause predicates.
 * @param {number} options.page - Page to retrieve.
 * @param {number} options.perPage - Number of community contact records to return per page.
 * @returns {string} Query string.
 */
const contactGetSearch = ({ client, whereClausePredicates, page, perPage }) => `
SELECT COUNT(*) AS total
FROM lookup.contacts
WHERE ${whereClausePredicates};

SELECT
    id,
    match_type,
    match_value,
    match_receiver,
    telecom,
    created,
    last_updated
FROM lookup.contacts
${
	client === "mssql"
		? "CROSS APPLY OPENJSON(lookup.contacts.telecom, '$') telecom_parsed"
		: ""
}
WHERE ${whereClausePredicates}
ORDER BY match_value DESC
OFFSET ${page * perPage} ROWS
FETCH NEXT ${perPage} ROWS ONLY;`;

module.exports = { contactDelete, contactGetRead, contactGetSearch };
