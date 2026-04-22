#!/usr/bin/env node
/**
 * AILCC Stress Test Script
 * Simulates 100 task dispatches to validate autonomous delegation and 90% success rate.
 */

const DISPATCH_API = 'http://localhost:3000/api/dispatch';
const TOTAL_TASKS = 100;

const TASK_TEMPLATES = [
    { description: 'Research competitor pricing models', priority: 'medium' },
    { description: 'Analyze user feedback from last week', priority: 'high' },
    { description: 'Generate weekly status report', priority: 'low' },
    { description: 'Debug authentication flow', priority: 'urgent' },
    { description: 'Review pull request for feature X', priority: 'medium' },
    { description: 'Update documentation for API endpoints', priority: 'low' },
    { description: 'Investigate performance bottleneck', priority: 'high' },
    { description: 'Create mockup for new dashboard', priority: 'medium' },
    { description: 'Test new deployment pipeline', priority: 'high' },
    { description: 'Optimize database queries', priority: 'urgent' },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function dispatchTask(taskId, template) {
    const payload = {
        description: `[Task ${taskId}] ${template.description}`,
        priority: template.priority,
        taskId: `stress-test-${taskId}`,
    };

    try {
        const res = await fetch(DISPATCH_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        
        return {
            taskId,
            success: res.ok && data.taskId,
            routedTo: data.routedTo || 'unknown',
            autonomous: !data.requiresApproval,
            responseTime: Date.now(),
        };
    } catch (error) {
        return {
            taskId,
            success: false,
            error: error.message,
            autonomous: false,
        };
    }
}

async function runStressTest() {
    console.log('\n🚀 AILCC Stress Test - Starting 100 Task Dispatch\n');
    console.log('='.repeat(60));
    
    const results = [];
    const startTime = Date.now();
    
    // Dispatch tasks in batches of 10 to avoid overwhelming the system
    const BATCH_SIZE = 10;
    
    for (let batch = 0; batch < TOTAL_TASKS / BATCH_SIZE; batch++) {
        const batchStart = batch * BATCH_SIZE;
        const batchPromises = [];
        
        for (let i = 0; i < BATCH_SIZE; i++) {
            const taskId = batchStart + i + 1;
            const template = TASK_TEMPLATES[i % TASK_TEMPLATES.length];
            batchPromises.push(dispatchTask(taskId, template));
        }
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Progress indicator
        const progress = ((batch + 1) * BATCH_SIZE / TOTAL_TASKS * 100).toFixed(0);
        const successCount = results.filter(r => r.success).length;
        const autonomousCount = results.filter(r => r.autonomous).length;
        
        process.stdout.write(`\r📊 Progress: ${progress}% | Success: ${successCount}/${results.length} | Autonomous: ${autonomousCount}/${results.length}`);
        
        // Small delay between batches
        if (batch < (TOTAL_TASKS / BATCH_SIZE) - 1) {
            await sleep(100);
        }
    }
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Calculate metrics
    const successfulTasks = results.filter(r => r.success).length;
    const autonomousTasks = results.filter(r => r.autonomous).length;
    const failedTasks = results.filter(r => !r.success);
    
    const successRate = (successfulTasks / TOTAL_TASKS * 100).toFixed(1);
    const autonomyRate = (autonomousTasks / TOTAL_TASKS * 100).toFixed(1);
    
    // Agent distribution
    const agentDistribution = {};
    results.filter(r => r.success).forEach(r => {
        agentDistribution[r.routedTo] = (agentDistribution[r.routedTo] || 0) + 1;
    });
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📈 STRESS TEST RESULTS\n');
    
    console.log(`   Total Tasks:        ${TOTAL_TASKS}`);
    console.log(`   Successful:         ${successfulTasks}`);
    console.log(`   Failed:             ${failedTasks.length}`);
    console.log(`   Success Rate:       ${successRate}%`);
    console.log(`   Autonomous Rate:    ${autonomyRate}%`);
    console.log(`   Total Time:         ${totalTime.toFixed(2)}s`);
    console.log(`   Avg Time/Task:      ${(totalTime / TOTAL_TASKS * 1000).toFixed(1)}ms`);
    
    console.log('\n📊 Agent Distribution:');
    Object.entries(agentDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([agent, count]) => {
            const pct = (count / successfulTasks * 100).toFixed(1);
            console.log(`   ${agent.padEnd(15)} ${count} tasks (${pct}%)`);
        });
    
    if (failedTasks.length > 0) {
        console.log('\n⚠️ Failed Tasks:');
        failedTasks.slice(0, 5).forEach(t => {
            console.log(`   Task ${t.taskId}: ${t.error || 'Unknown error'}`);
        });
        if (failedTasks.length > 5) {
            console.log(`   ... and ${failedTasks.length - 5} more`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Final verdict
    const TARGET_AUTONOMY = 90;
    if (parseFloat(autonomyRate) >= TARGET_AUTONOMY) {
        console.log(`✅ TARGET MET: ${autonomyRate}% autonomous (goal: ${TARGET_AUTONOMY}%)`);
    } else {
        console.log(`❌ TARGET MISSED: ${autonomyRate}% autonomous (goal: ${TARGET_AUTONOMY}%)`);
        console.log(`   Need ${(TARGET_AUTONOMY - parseFloat(autonomyRate)).toFixed(1)}% improvement`);
    }
    
    console.log('\n');
    
    // Return summary for programmatic use
    return {
        total: TOTAL_TASKS,
        successful: successfulTasks,
        autonomous: autonomousTasks,
        successRate: parseFloat(successRate),
        autonomyRate: parseFloat(autonomyRate),
        totalTimeSeconds: totalTime,
        agentDistribution,
        targetMet: parseFloat(autonomyRate) >= TARGET_AUTONOMY,
    };
}

// Run the test
runStressTest()
    .then(summary => {
        process.exit(summary.targetMet ? 0 : 1);
    })
    .catch(err => {
        console.error('❌ Stress test failed:', err.message);
        process.exit(1);
    });
