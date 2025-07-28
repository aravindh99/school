const School = require('../models/School');

const initializeDefaultSchool = async () => {
    try {
        // Check if default school already exists
        const existingSchool = await School.findOne({
            name: 'Vidya Mandir',
            city: 'Mylapore',
            type: 'school'
        });

        if (!existingSchool) {
            const defaultSchool = new School({
                name: 'Vidya Mandir',
                city: 'Mylapore',
                type: 'school',
                status: 'approved',
                classes: ['7', '8', '9', '10', '11', '12'],
                approvedAt: new Date()
            });

            await defaultSchool.save();
            console.log('Default school "Vidya Mandir - Mylapore" created');
        }

        // Check if default college already exists
        const existingCollege = await School.findOne({
            name: 'Loyola College',
            city: 'Chennai',
            type: 'college'
        });

        if (!existingCollege) {
            const defaultCollege = new School({
                name: 'Loyola College',
                city: 'Chennai',
                type: 'college',
                status: 'approved',
                classes: [], // Colleges don't have classes
                approvedAt: new Date()
            });

            await defaultCollege.save();
            console.log('Default college "Loyola College - Chennai" created');
        }
    } catch (error) {
        console.error('Error initializing default institutions:', error);
    }
};

const initializeDefaultInstitutions = initializeDefaultSchool;

module.exports = { initializeDefaultSchool, initializeDefaultInstitutions };