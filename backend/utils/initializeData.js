const School = require('../models/School');

const initializeDefaultSchool = async () => {
    try {
        // Check if default school already exists
        const existingSchool = await School.findOne({
            name: 'Vidya Mandir',
            city: 'Mylapore'
        });

        if (!existingSchool) {
            const defaultSchool = new School({
                name: 'Vidya Mandir',
                city: 'Mylapore',
                status: 'approved',
                classes: ['7', '8', '9', '10', '11', '12'],
                approvedAt: new Date()
            });

            await defaultSchool.save();
            console.log('Default school "Vidya Mandir - Mylapore" created');
        }
    } catch (error) {
        console.error('Error initializing default school:', error);
    }
};

module.exports = { initializeDefaultSchool };