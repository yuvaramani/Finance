
/**
 * Statement Format Service
 * Handles statement format definitions using localStorage for persistence
 */

const STORAGE_KEY = 'finance_statement_formats';

// Helper to generate ID
const generateId = () => Math.floor(Math.random() * 1000000);

export const statementFormatService = {
    /**
     * Get all formats
     * @returns {Promise} List of formats
     */
    async getFormats() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const formats = stored ? JSON.parse(stored) : [];
            return { success: true, data: { formats } };
        } catch (error) {
            console.error('Error fetching formats:', error);
            return { success: false, data: { formats: [] } };
        }
    },

    /**
     * Create new format
     * @param {Object} data - Format data
     * @returns {Promise} Created format
     */
    async createFormat(data) {
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const formats = stored ? JSON.parse(stored) : [];

            const newFormat = {
                id: generateId(),
                ...data,
                createdAt: new Date().toISOString()
            };

            formats.push(newFormat);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formats));

            return { success: true, data: { format: newFormat } };
        } catch (error) {
            return { success: false, message: 'Failed to create format' };
        }
    },

    /**
     * Update format
     * @param {number} id - Format ID
     * @param {Object} data - Updated data
     * @returns {Promise} Updated format
     */
    async updateFormat(id, data) {
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            let formats = stored ? JSON.parse(stored) : [];

            const index = formats.findIndex(f => f.id === id);
            if (index === -1) throw new Error('Format not found');

            formats[index] = { ...formats[index], ...data };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formats));

            return { success: true, data: { format: formats[index] } };
        } catch (error) {
            return { success: false, message: 'Failed to update format' };
        }
    },

    /**
     * Delete format
     * @param {number} id - Format ID
     * @returns {Promise}
     */
    async deleteFormat(id) {
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            let formats = stored ? JSON.parse(stored) : [];

            formats = formats.filter(f => f.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formats));

            return { success: true };
        } catch (error) {
            return { success: false, message: 'Failed to delete format' };
        }
    }
};
