/**
 * Script to check and create missing indexes
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import Job from '@/models/Job';
import User from '@/models/User';
import Company from '@/models/Company';

// Parse .env.local manually
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    process.env[key] = value;
                }
            });
        }
    } catch (e) { 
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.warn('⚠️ Could not load .env.local:', errorMsg);
    }
}

loadEnv();

async function checkIndexes() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI missing');
        return;
    }

    console.log('🔍 Checking Database Indexes...\n');

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to database\n');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not available');
        }

        // Check Jobs collection
        console.log('═══════════════════════════════════════');
        console.log('📊 JOBS COLLECTION INDEXES');
        console.log('═══════════════════════════════════════');
        
        const jobIndexes = await db.collection('jobs').indexes();
        console.log(`\nCurrent indexes (${jobIndexes.length}):`);
        jobIndexes.forEach((idx: any) => {
            const keys = Object.keys(idx.key).map(k => `${k}: ${idx.key[k]}`).join(', ');
            console.log(`  ✓ ${idx.name}: { ${keys} }`);
        });

        console.log('\nExpected indexes from model:');
        const expectedJobIndexes = [
            '{ createdAt: -1 }',
            '{ updatedAt: -1 }',
            '{ published: 1, createdAt: -1 }',
            '{ featured: 1, published: 1 }',
            '{ recruiter: 1 }',
            '{ companyId: 1 }',
            '{ country: 1 }',
            '{ type: 1 }',
        ];
        expectedJobIndexes.forEach(idx => console.log(`  - ${idx}`));

        // Dynamically determine missing indexes
        const existingJobIndexNames = new Set(jobIndexes.map((idx: any) => idx.name));
        console.log('\nMissing indexes (if any will be created below):');
        console.log('  (Run after index creation to verify)');


        // Check Users collection
        console.log('\n═══════════════════════════════════════');
        console.log('📊 USERS COLLECTION INDEXES');
        console.log('═══════════════════════════════════════');
        
        const userIndexes = await db.collection('users').indexes();
        console.log(`\nCurrent indexes (${userIndexes.length}):`);
        userIndexes.forEach((idx: any) => {
            const keys = Object.keys(idx.key).map(k => `${k}: ${idx.key[k]}`).join(', ');
            console.log(`  ✓ ${idx.name}: { ${keys} }`);
        });

        console.log('\nExpected indexes from model:');
        const expectedUserIndexes = [
            '{ role: 1 }',
            '{ createdAt: -1 }',
            '{ lastOnline: -1 }',
        ];
        expectedUserIndexes.forEach(idx => console.log(`  - ${idx}`));

        console.log('\nMissing indexes (if any will be created below):');
        console.log('  (Run after index creation to verify)');

        // Check Companies collection
        console.log('\n═══════════════════════════════════════');
        console.log('📊 COMPANIES COLLECTION INDEXES');
        console.log('═══════════════════════════════════════');
        
        const companyIndexes = await db.collection('companies').indexes();
        console.log(`\nCurrent indexes (${companyIndexes.length}):`);
        companyIndexes.forEach((idx: any) => {
            const keys = Object.keys(idx.key).map(k => `${k}: ${idx.key[k]}`).join(', ');
            console.log(`  ✓ ${idx.name}: { ${keys} }`);
        });

        console.log('\nExpected indexes from model:');
        const expectedCompanyIndexes = [
            '{ featured: 1 }',
            '{ createdAt: -1 }',
        ];
        expectedCompanyIndexes.forEach(idx => console.log(`  - ${idx}`));

        console.log('\nMissing indexes (if any will be created below):');
        console.log('  (Run after index creation to verify)');

        // Create indexes using Mongoose models
        console.log('\n═══════════════════════════════════════');
        console.log('🔧 CREATING MISSING INDEXES');
        console.log('═══════════════════════════════════════\n');

        console.log('Creating Job indexes...');
        await Job.createIndexes();
        console.log('✅ Job indexes created/verified');

        console.log('Creating User indexes...');
        await User.createIndexes();
        console.log('✅ User indexes created/verified');

        console.log('Creating Company indexes...');
        await Company.createIndexes();
        console.log('✅ Company indexes created/verified');

        // Verify indexes were created
        console.log('\n═══════════════════════════════════════');
        console.log('✅ VERIFICATION');
        console.log('═══════════════════════════════════════\n');

        const newJobIndexes = await db.collection('jobs').indexes();
        console.log(`Jobs collection now has ${newJobIndexes.length} indexes`);
        
        const newUserIndexes = await db.collection('users').indexes();
        console.log(`Users collection now has ${newUserIndexes.length} indexes`);
        
        const newCompanyIndexes = await db.collection('companies').indexes();
        console.log(`Companies collection now has ${newCompanyIndexes.length} indexes`);

        console.log('\n✅ Index check and creation complete!\n');

        await mongoose.disconnect();

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

checkIndexes();
