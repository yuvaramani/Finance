
import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

/**
 * Statement Service
 * Handles statement import and transaction saving
 */
export const statementService = {
    /**
     * Upload and parse statement file
     * @param {File} file - Excel file
     * @param {Object} format - Selected statement format 
     * @returns {Promise} Parsed rows
     */
    async parseStatement(file, format) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bank_name', format.bankName);
        formData.append('date_col', format.dateColumn);
        formData.append('desc_col', format.descriptionColumn);
        formData.append('amount_format_type', format.amountFormat || 'separate_debit_credit');
        formData.append('debit_col', format.debitColumn || '');
        formData.append('credit_col', format.creditColumn || '');
        formData.append('amount_col', format.amountColumn || '');
        formData.append('drcr_col', format.drcrColumn || '');
        formData.append('debit_texts', format.debitTextTokens || '');
        formData.append('credit_texts', format.creditTextTokens || '');
        formData.append('trans_id_col', format.transactionIdColumn || '');

        const response = await axiosInstance.post('/statements/parse', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    /**
     * Bulk save transactions
     * @param {Array} transactions - List of valid transactions
     * @returns {Promise}
     */
    async saveTransactions(transactions, globalAccountId) {
        // Prepare payload with injected account ID
        const payload = transactions.map(t => ({
            ...t
        }));

        const promises = payload.map(row => {
            const isIncome = row.type === 'income';

            // Use correct endpoint
            const endpoint = isIncome ? ENDPOINTS.INCOMES.CREATE : ENDPOINTS.EXPENSES.CREATE;

            // Merge bank description and user notes
            const fullDescription = row.notes
                ? `${row.description || ''} - ${row.notes}`
                : (row.description || '');

            // Construct payload matching Controller requirements
            const data = {
                date: row.date,
                amount: row.amount,
                account_id: globalAccountId,
                description: fullDescription.substring(0, 1000), // Enforce max length
                transaction_id: row.transaction_id || null,
                // Use correct foreign key based on type
                [isIncome ? 'source_id' : 'category_id']: row.category?.id || row.category,
            };

            return axiosInstance.post(endpoint, data);
        });

        return Promise.all(promises);
    }
};
