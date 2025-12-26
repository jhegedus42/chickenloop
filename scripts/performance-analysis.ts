/**
 * Comprehensive Performance Analysis Script
 * This script analyzes the application's performance and identifies bottlenecks
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

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
    } catch (e) { console.warn('⚠️ Could not load .env.local'); }
}

loadEnv();

interface BenchmarkResult {
    name: string;
    duration: number;
    success: boolean;
    details?: any;
}

const results: BenchmarkResult[] = [];

function recordResult(name: string, duration: number, success: boolean = true, details?: any) {
    results.push({ name, duration, success, details });
}

async function analyzePerformance() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI missing');
        return;
    }

    console.log('🔍 Starting Comprehensive Performance Analysis...\n');
    console.log(`📡 Database: ${uri.replace(/:([^:@]+)@/, ':****@')}\n`);

    try {
        // 1. Connection Performance
        console.log('═══════════════════════════════════════');
        console.log('📊 CONNECTION PERFORMANCE');
        console.log('═══════════════════════════════════════');
        
        const startConnect = Date.now();
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        const connectTime = Date.now() - startConnect;
        recordResult('Connection Time', connectTime);
        console.log(`✅ Connected in: ${connectTime}ms`);

        // 2. Latency Test
        const startPing = Date.now();
        await mongoose.connection.db?.admin().ping();
        const pingTime = Date.now() - startPing;
        recordResult('Network Latency (ping)', pingTime);
        console.log(`🏓 Network latency: ${pingTime}ms`);

        // Get collection stats
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not available');
        }

        console.log('\n═══════════════════════════════════════');
        console.log('📊 DATABASE STATISTICS');
        console.log('═══════════════════════════════════════');

        const collections = ['jobs', 'users', 'companies', 'cvs'];
        for (const collName of collections) {
            try {
                const stats = await db.collection(collName).stats();
                console.log(`\n📁 ${collName}:`);
                console.log(`   Documents: ${stats.count}`);
                console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`   Avg Doc Size: ${stats.avgObjSize ? (stats.avgObjSize / 1024).toFixed(2) + ' KB' : 'N/A'}`);
                console.log(`   Indexes: ${stats.nindexes}`);
                console.log(`   Index Size: ${((stats.totalIndexSize || 0) / 1024).toFixed(2)} KB`);
            } catch (e) {
                console.log(`   ⚠️  Collection ${collName} not found or error: ${(e as Error).message}`);
            }
        }

        // 3. Query Performance Tests
        console.log('\n═══════════════════════════════════════');
        console.log('📊 QUERY PERFORMANCE');
        console.log('═══════════════════════════════════════');

        // Simple query
        const start1 = Date.now();
        await db.collection('jobs').findOne({});
        const query1Time = Date.now() - start1;
        recordResult('Simple Query (1 doc)', query1Time);
        console.log(`\n🔍 Simple Query (1 doc): ${query1Time}ms`);

        // Moderate query
        const start2 = Date.now();
        const docs = await db.collection('jobs').find({}).limit(100).toArray();
        const query2Time = Date.now() - start2;
        const dataSize = JSON.stringify(docs).length;
        recordResult('Moderate Query (100 docs)', query2Time, true, { 
            docs: docs.length, 
            size: dataSize 
        });
        console.log(`📦 Moderate Query (100 docs): ${query2Time}ms`);
        console.log(`   Data size: ${(dataSize / 1024).toFixed(2)} KB`);
        console.log(`   Throughput: ${((dataSize / 1024) / (query2Time / 1000)).toFixed(2)} KB/s`);

        // Indexed query test
        const start3 = Date.now();
        const publishedDocs = await db.collection('jobs')
            .find({ published: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();
        const query3Time = Date.now() - start3;
        recordResult('Indexed Query (published, sorted)', query3Time, true, { 
            docs: publishedDocs.length 
        });
        console.log(`📊 Indexed Query (published + sort): ${query3Time}ms (${publishedDocs.length} docs)`);

        // Featured query test
        const start4 = Date.now();
        const featuredDocs = await db.collection('jobs')
            .find({ featured: true, published: true })
            .toArray();
        const query4Time = Date.now() - start4;
        recordResult('Featured Jobs Query', query4Time, true, { 
            docs: featuredDocs.length 
        });
        console.log(`⭐ Featured Query: ${query4Time}ms (${featuredDocs.length} docs)`);

        // Aggregation test
        const start5 = Date.now();
        const aggResult = await db.collection('jobs').aggregate([
            { $match: { published: { $ne: false } } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        const aggTime = Date.now() - start5;
        recordResult('Aggregation (group by type)', aggTime, true, { 
            groups: aggResult.length 
        });
        console.log(`📈 Aggregation Query: ${aggTime}ms (${aggResult.length} groups)`);

        // 4. Index Analysis
        console.log('\n═══════════════════════════════════════');
        console.log('📊 INDEX ANALYSIS');
        console.log('═══════════════════════════════════════');

        for (const collName of collections) {
            try {
                const indexes = await db.collection(collName).indexes();
                console.log(`\n📁 ${collName} indexes (${indexes.length}):`);
                indexes.forEach((idx: any) => {
                    const keys = Object.keys(idx.key).map(k => `${k}: ${idx.key[k]}`).join(', ');
                    console.log(`   - ${idx.name}: { ${keys} }`);
                });
            } catch (e) {
                console.log(`   ⚠️  Could not get indexes for ${collName}`);
            }
        }

        // 5. Query Explain Analysis
        console.log('\n═══════════════════════════════════════');
        console.log('📊 QUERY EXECUTION PLANS');
        console.log('═══════════════════════════════════════');

        const explain = await db.collection('jobs')
            .find({ published: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .explain('executionStats');

        const execStats = (explain as any).executionStats;
        console.log('\n🔍 Published Jobs Query Execution:');
        console.log(`   Execution time: ${execStats.executionTimeMillis}ms`);
        console.log(`   Documents examined: ${execStats.totalDocsExamined}`);
        console.log(`   Documents returned: ${execStats.nReturned}`);
        console.log(`   Index used: ${execStats.executionStages?.indexName || 'N/A'}`);
        
        const efficiency = execStats.nReturned / (execStats.totalDocsExamined || 1);
        console.log(`   Query efficiency: ${(efficiency * 100).toFixed(1)}%`);
        
        recordResult('Query Execution Analysis', execStats.executionTimeMillis, true, {
            examined: execStats.totalDocsExamined,
            returned: execStats.nReturned,
            efficiency: (efficiency * 100).toFixed(1) + '%'
        });

        // 6. Concurrent Query Test
        console.log('\n═══════════════════════════════════════');
        console.log('📊 CONCURRENT QUERY PERFORMANCE');
        console.log('═══════════════════════════════════════');

        const concurrentStart = Date.now();
        const concurrentQueries = Array(10).fill(null).map(() =>
            db.collection('jobs').find({ published: { $ne: false } }).limit(10).toArray()
        );
        await Promise.all(concurrentQueries);
        const concurrentTime = Date.now() - concurrentStart;
        recordResult('10 Concurrent Queries', concurrentTime);
        console.log(`\n🔀 10 concurrent queries: ${concurrentTime}ms`);
        console.log(`   Avg per query: ${(concurrentTime / 10).toFixed(1)}ms`);

        // 7. Summary and Recommendations
        console.log('\n═══════════════════════════════════════');
        console.log('📊 PERFORMANCE SUMMARY');
        console.log('═══════════════════════════════════════\n');

        const bottlenecks: string[] = [];
        const recommendations: string[] = [];

        // Analyze results
        if (connectTime > 2000) {
            bottlenecks.push(`⚠️  Slow connection time: ${connectTime}ms (expected <2000ms)`);
            recommendations.push('Consider using connection pooling or a local MongoDB instance for development');
        } else {
            console.log(`✅ Connection time: ${connectTime}ms (Good)`);
        }

        if (pingTime > 200) {
            bottlenecks.push(`⚠️  High network latency: ${pingTime}ms (expected <200ms)`);
            recommendations.push('Network latency is high - this is typical for cloud databases');
        } else {
            console.log(`✅ Network latency: ${pingTime}ms (Excellent)`);
        }

        if (query2Time > 500) {
            bottlenecks.push(`⚠️  Slow 100-doc query: ${query2Time}ms (expected <500ms)`);
            recommendations.push('Consider adding indexes or using pagination for large result sets');
        } else {
            console.log(`✅ Query performance: ${query2Time}ms for 100 docs (Good)`);
        }

        if (efficiency < 0.5) {
            bottlenecks.push(`⚠️  Low query efficiency: ${(efficiency * 100).toFixed(1)}% (expected >50%)`);
            recommendations.push('Indexes may not be optimal - consider reviewing query patterns');
        } else {
            console.log(`✅ Query efficiency: ${(efficiency * 100).toFixed(1)}% (Good)`);
        }

        if (bottlenecks.length > 0) {
            console.log('\n🔴 IDENTIFIED BOTTLENECKS:');
            bottlenecks.forEach(b => console.log(`   ${b}`));
        }

        if (recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            recommendations.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
        }

        // Output detailed report
        console.log('\n═══════════════════════════════════════');
        console.log('📊 DETAILED METRICS');
        console.log('═══════════════════════════════════════\n');

        results.forEach(r => {
            const status = r.success ? '✅' : '❌';
            console.log(`${status} ${r.name}: ${r.duration}ms`);
            if (r.details) {
                Object.keys(r.details).forEach(key => {
                    console.log(`   └─ ${key}: ${r.details[key]}`);
                });
            }
        });

        console.log('\n═══════════════════════════════════════');
        console.log('✅ Performance Analysis Complete!');
        console.log('═══════════════════════════════════════\n');

        await mongoose.disconnect();

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

analyzePerformance();
