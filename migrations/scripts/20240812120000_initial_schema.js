/**
 * Migration: Initial Schema Setup
 * Created: 2024-08-12T12:00:00.000Z
 * 
 * Description:
 * Sets up the initial database schema with indexes and constraints
 */

async function up(db) {
    console.log('Running migration: Initial Schema Setup');
    
    // Create indexes for users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ phone: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 });
    
    // Create indexes for loyalty_cards collection
    await db.collection('loyalty_cards').createIndex({ userId: 1 });
    await db.collection('loyalty_cards').createIndex({ cardNumber: 1 }, { unique: true });
    await db.collection('loyalty_cards').createIndex({ isActive: 1 });
    
    // Create indexes for transactions collection
    await db.collection('transactions').createIndex({ userId: 1 });
    await db.collection('transactions').createIndex({ loyaltyCardId: 1 });
    await db.collection('transactions').createIndex({ createdAt: 1 });
    await db.collection('transactions').createIndex({ type: 1 });
    
    // Create indexes for rewards collection
    await db.collection('rewards').createIndex({ isActive: 1 });
    await db.collection('rewards').createIndex({ pointsRequired: 1 });
    await db.collection('rewards').createIndex({ category: 1 });
    
    // Create indexes for reward_redemptions collection
    await db.collection('reward_redemptions').createIndex({ userId: 1 });
    await db.collection('reward_redemptions').createIndex({ rewardId: 1 });
    await db.collection('reward_redemptions').createIndex({ status: 1 });
    await db.collection('reward_redemptions').createIndex({ createdAt: 1 });
    
    // Create indexes for admin_users collection
    await db.collection('admin_users').createIndex({ email: 1 }, { unique: true });
    await db.collection('admin_users').createIndex({ isActive: 1 });
    
    console.log('✅ Migration completed: Initial Schema Setup');
}

async function down(db) {
    console.log('Rolling back migration: Initial Schema Setup');
    
    // Drop indexes for users collection
    await db.collection('users').dropIndex({ email: 1 });
    await db.collection('users').dropIndex({ phone: 1 });
    await db.collection('users').dropIndex({ createdAt: 1 });
    
    // Drop indexes for loyalty_cards collection
    await db.collection('loyalty_cards').dropIndex({ userId: 1 });
    await db.collection('loyalty_cards').dropIndex({ cardNumber: 1 });
    await db.collection('loyalty_cards').dropIndex({ isActive: 1 });
    
    // Drop indexes for transactions collection
    await db.collection('transactions').dropIndex({ userId: 1 });
    await db.collection('transactions').dropIndex({ loyaltyCardId: 1 });
    await db.collection('transactions').dropIndex({ createdAt: 1 });
    await db.collection('transactions').dropIndex({ type: 1 });
    
    // Drop indexes for rewards collection
    await db.collection('rewards').dropIndex({ isActive: 1 });
    await db.collection('rewards').dropIndex({ pointsRequired: 1 });
    await db.collection('rewards').dropIndex({ category: 1 });
    
    // Drop indexes for reward_redemptions collection
    await db.collection('reward_redemptions').dropIndex({ userId: 1 });
    await db.collection('reward_redemptions').dropIndex({ rewardId: 1 });
    await db.collection('reward_redemptions').dropIndex({ status: 1 });
    await db.collection('reward_redemptions').dropIndex({ createdAt: 1 });
    
    // Drop indexes for admin_users collection
    await db.collection('admin_users').dropIndex({ email: 1 });
    await db.collection('admin_users').dropIndex({ isActive: 1 });
    
    console.log('✅ Migration rolled back: Initial Schema Setup');
}

module.exports = { up, down };
