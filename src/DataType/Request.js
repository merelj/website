import { generateReference } from 'letter-generator/utility';
import { deepCopyObject } from '../Utility/common';
import { defaultFields } from '../Utility/requests';

/**
 * @typedef {"access" | "erasure" | "rectification" | "custom"} RequestType
 */

/**
 * @typedef {"fax" | "letter" | "email"} TransportMedium
 */

/**
 * @typedef {Object} IdDataElement
 * @property {String} desc A description of this element, e.g. 'Name'.
 * @property {"input" | "textarea" | "address" | "name" | "birthdate"} type The element's type, where:
 *     - `input` is a single-line string
 *     - `textarea` is a multi-line string
 *     - `address` is an object representing an address like this:
 *         `{street_1: '5 Main St.', street_2: 'Suburbia', place: 'My City 12345', country: 'A Country', primary: true}`
 *     - `name` is an alias for `string` but is used to insert the user's name in the letter
 *     - `birthdate` is the user's date of birth as a string, e.g. '1970-01-01'
 * @property {boolean} [optional=false] Whether we recommend giving this piece of information (`false`) or not (`true`).
 * @property {String} value The value entered by the user for this element.
 */

export default class Request {
    constructor(props) {
        const today = new Date();

        /**
         * @type {RequestType}
         */
        this.type = 'access';
        /**
         * @type {TransportMedium}
         */
        this.transport_medium = 'fax';
        /**
         * @type {String}
         */
        this.reference = generateReference(today);
        /**
         * @type {String}
         */
        this.date = today.toISOString().substring(0, 10);
        /**
         * The new-line delimited address of the request recipient.
         * @type {String}
         */
        this.recipient_address = '';
        /**
         * The signature to be included after the content in pdfmake format. If not left blank, this can be:
         *     - `{ type: 'text', name: 'Name' }` to just add the name
         *     - `{ type: 'image', name: 'Name', value: 'base64-encoded image' }` to include an image and the name
         *         underneath
         */
        this.signature = { type: 'text', value: '' };
        /**
         * The user-defined part of the information block.
         * @type {String}
         */
        this.information_block = '';
        /**
         * @type {String}
         */
        this.language = LOCALE;

        /**
         * The 'Get data in a machine-readable format' flag for access requests.
         * @type {boolean}
         */
        this.data_portability = false;
        /**
         * The 'Erase all data' flag for erasure requests.
         * @type {boolean}
         */
        this.erase_all = true;

        /**
         * @type {IdDataElement[]}
         */
        this.id_data = deepCopyObject(defaultFields(LOCALE));
        /**
         * A list of other entities and services the selected company is the controller for.
         * @type {String[]}
         */
        this.recipient_runs = [];

        /**
         * For erasure requests: The data the user has specified to be erased (if `this.erase_all` is `false`).
         * @type {String}
         */
        this.erasure_data = '';
        /**
         * For rectification requests: The data the user has specified to be rectified.
         * @type {IdDataElement[]}
         */
        this.rectification_data = [];
        /**
         * For custom requests: The parameters for the letter as entered by the user.
         * @type {Object}
         * @property {String} content
         * @property {String} subject
         * @property {Object} address (@see {@link IdDataElement})
         * @property {String} name
         */
        this.custom_data = {
            content: '',
            subject: '',
            sender_address: {},
            name: ''
        };

        /**
         * Whether the user needs to enter ID data for the request.
         * @type {boolean}
         */
        this.is_tracking_request = false;
    }
}