/**
 * Migration: add-training-system
 * Created: 2025-08-12T23:19:11.035Z
 *
 * Description:
 * Adds training system and download center collections with indexes
 */

async function up(db) {
    console.log('Running migration: add-training-system');

    // Create training_categories collection
    await db.createCollection('training_categories');
    await db.collection('training_categories').createIndex({ name: 1 }, { unique: true });
    await db.collection('training_categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('training_categories').createIndex({ isActive: 1 });
    await db.collection('training_categories').createIndex({ sortOrder: 1 });

    // Create training_videos collection
    await db.createCollection('training_videos');
    await db.collection('training_videos').createIndex({ categoryId: 1 });
    await db.collection('training_videos').createIndex({ title: 'text', description: 'text' });
    await db.collection('training_videos').createIndex({ isActive: 1 });
    await db.collection('training_videos').createIndex({ sortOrder: 1 });
    await db.collection('training_videos').createIndex({ createdAt: 1 });
    await db.collection('training_videos').createIndex({ videoType: 1 });

    // Create document_categories collection
    await db.createCollection('document_categories');
    await db.collection('document_categories').createIndex({ name: 1 }, { unique: true });
    await db.collection('document_categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('document_categories').createIndex({ isActive: 1 });
    await db.collection('document_categories').createIndex({ sortOrder: 1 });

    // Create documents collection
    await db.createCollection('documents');
    await db.collection('documents').createIndex({ categoryId: 1 });
    await db.collection('documents').createIndex({ title: 'text', description: 'text', tags: 'text' });
    await db.collection('documents').createIndex({ isActive: 1 });
    await db.collection('documents').createIndex({ documentType: 1 });
    await db.collection('documents').createIndex({ createdAt: 1 });
    await db.collection('documents').createIndex({ downloadCount: 1 });

    // Create video_views collection for analytics
    await db.createCollection('video_views');
    await db.collection('video_views').createIndex({ videoId: 1 });
    await db.collection('video_views').createIndex({ userId: 1 });
    await db.collection('video_views').createIndex({ viewedAt: 1 });
    await db.collection('video_views').createIndex({ videoId: 1, userId: 1 });

    // Create document_downloads collection for analytics
    await db.createCollection('document_downloads');
    await db.collection('document_downloads').createIndex({ documentId: 1 });
    await db.collection('document_downloads').createIndex({ userId: 1 });
    await db.collection('document_downloads').createIndex({ downloadedAt: 1 });
    await db.collection('document_downloads').createIndex({ documentId: 1, userId: 1 });

    console.log('✅ Migration completed: add-training-system');
}

async function down(db) {
    console.log('Rolling back migration: add-training-system');

    // Drop collections
    await db.collection('training_categories').drop();
    await db.collection('training_videos').drop();
    await db.collection('document_categories').drop();
    await db.collection('documents').drop();
    await db.collection('video_views').drop();
    await db.collection('document_downloads').drop();

    console.log('✅ Migration rolled back: add-training-system');
}

module.exports = { up, down };
