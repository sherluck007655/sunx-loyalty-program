/**
 * Migration: seed-training-data
 * Created: 2025-08-12T23:19:48.689Z
 *
 * Description:
 * Seeds initial training categories and document categories
 */

async function up(db) {
    console.log('Running migration: seed-training-data');

    // Seed training categories
    const trainingCategories = [
        {
            name: 'Application Training',
            slug: 'application-training',
            description: 'Learn how to use the loyalty program application effectively',
            icon: 'fas fa-mobile-alt',
            isActive: true,
            sortOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Inverter Settings',
            slug: 'inverter-settings',
            description: 'Complete guide to inverter configuration and optimization',
            icon: 'fas fa-cogs',
            isActive: true,
            sortOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Lithium Battery Installation',
            slug: 'lithium-battery-installation',
            description: 'Step-by-step lithium battery installation and setup',
            icon: 'fas fa-battery-full',
            isActive: true,
            sortOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Safety Procedures',
            slug: 'safety-procedures',
            description: 'Essential safety guidelines for all installations',
            icon: 'fas fa-shield-alt',
            isActive: true,
            sortOrder: 4,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Troubleshooting',
            slug: 'troubleshooting',
            description: 'Common issues and their solutions',
            icon: 'fas fa-tools',
            isActive: true,
            sortOrder: 5,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    await db.collection('training_categories').insertMany(trainingCategories);

    // Seed document categories
    const documentCategories = [
        {
            name: 'Inverter Documents',
            slug: 'inverter-documents',
            description: 'User manuals, datasheets, and specifications for inverters',
            icon: 'fas fa-file-pdf',
            isActive: true,
            sortOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Battery Documents',
            slug: 'battery-documents',
            description: 'Battery manuals, specifications, and installation guides',
            icon: 'fas fa-battery-half',
            isActive: true,
            sortOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Solar Panel Documents',
            slug: 'solar-panel-documents',
            description: 'Solar panel specifications and installation guides',
            icon: 'fas fa-solar-panel',
            isActive: true,
            sortOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Installation Guides',
            slug: 'installation-guides',
            description: 'Complete installation manuals and procedures',
            icon: 'fas fa-hammer',
            isActive: true,
            sortOrder: 4,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Warranty Documents',
            slug: 'warranty-documents',
            description: 'Warranty information and claim procedures',
            icon: 'fas fa-certificate',
            isActive: true,
            sortOrder: 5,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Technical Specifications',
            slug: 'technical-specifications',
            description: 'Detailed technical specifications and datasheets',
            icon: 'fas fa-clipboard-list',
            isActive: true,
            sortOrder: 6,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    await db.collection('document_categories').insertMany(documentCategories);

    console.log('✅ Migration completed: seed-training-data');
}

async function down(db) {
    console.log('Rolling back migration: seed-training-data');

    // Remove seeded data
    await db.collection('training_categories').deleteMany({});
    await db.collection('document_categories').deleteMany({});

    console.log('✅ Migration rolled back: seed-training-data');
}

module.exports = { up, down };
