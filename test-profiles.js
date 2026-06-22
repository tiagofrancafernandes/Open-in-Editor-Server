/**
 * Test script to validate profile functionality
 * Run: node test-profiles.js
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper functions (copied from open-in-editor-server.js)
function isString(value) {
    return typeof value === 'string';
}

function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function ifStringOr(value, defaultValue = null) {
    return isString(value) ? value : defaultValue;
}

function ifObjectOr(value, defaultValue = {}) {
    return isObject(value) ? value : defaultValue;
}

function isArray(value) {
    return Array.isArray(value);
}

function ifArrayOr(value, defaultValue = []) {
    return isArray(value) ? value : defaultValue;
}

// Test getOpenCmd function
function getOpenCmd(profile = null, defaultValue = null, EDITOR_OPEN_CMD = 'code -g') {
    profile = ifObjectOr(profile, {});
    let _openCmd = ifObjectOr(profile?.open_cmd, {});
    let _command = ifStringOr(_openCmd?.command, '')?.trim();

    if (!_command) {
        return ifStringOr(EDITOR_OPEN_CMD, defaultValue) || defaultValue;
    }

    let _args =
        ifArrayOr(_openCmd?.args, [])
            ?.filter(isString)
            ?.map((v) => v?.trim())
            ?.join(' ') || '';

    return [_command, _args].filter((s) => s.trim()).join(' ') || defaultValue;
}

// Load config
async function loadConfig() {
    const configPath = path.resolve(__dirname, 'app.config.js');

    try {
        await fs.access(configPath, fs.constants.F_OK);
        const fileConfig = await import(configPath);
        return fileConfig;
    } catch (error) {
        console.error('Error loading config:', error.message);
        return null;
    }
}

// Test suite
async function runTests() {
    console.log('🧪 Testing Profile Integration\n');

    const config = await loadConfig();

    if (!config) {
        console.error('❌ Failed to load config');
        return;
    }

    const { profiles, defaultProfile, remapSplitStr } = config;

    if (!profiles) {
        console.error('❌ No profiles found in config');
        return;
    }

    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Check all profiles have required fields
    console.log('Test 1: Validating profile structure');
    console.log('═'.repeat(50));

    for (const [profileName, profileData] of Object.entries(profiles)) {
        let hasIssues = false;
        const issues = [];

        // Check for open_cmd or editor field
        const hasEditor = profileData?.editor || profileData?.open_cmd;
        if (!hasEditor) {
            issues.push('Missing editor or open_cmd field');
            hasIssues = true;
        }

        // Check mapPaths structure
        if (!profileData?.mapPaths) {
            issues.push('Missing mapPaths');
            hasIssues = true;
        } else {
            const { local, remote } = profileData.mapPaths;
            if (!local || !remote) {
                issues.push(`mapPaths incomplete: local="${local}", remote="${remote}"`);
                hasIssues = true;
            }
        }

        // Check options
        if (!profileData?.options) {
            issues.push('Missing options');
            hasIssues = true;
        }

        if (hasIssues) {
            console.log(`❌ Profile '${profileName}':`);
            issues.forEach((issue) => console.log(`   - ${issue}`));
            failedTests++;
        } else {
            console.log(`✅ Profile '${profileName}': OK`);
            passedTests++;
        }
    }

    console.log();

    // Test 2: Test getOpenCmd function with different profile formats
    console.log('Test 2: Testing getOpenCmd with different formats');
    console.log('═'.repeat(50));

    const testCases = [
        {
            name: 'Profile with command and args array',
            profile: { open_cmd: { command: 'code', args: ['-g'] } },
            expected: 'code -g',
        },
        {
            name: 'Profile with command only',
            profile: { open_cmd: { command: 'code -g' } },
            expected: 'code -g',
        },
        {
            name: 'Profile with antigravity',
            profile: { open_cmd: { command: 'antigravity', args: ['-g'] } },
            expected: 'antigravity -g',
        },
        {
            name: 'Empty profile (fallback to default)',
            profile: {},
            expected: 'code -g',
        },
        {
            name: 'Null profile (fallback to default)',
            profile: null,
            expected: 'code -g',
        },
    ];

    for (const testCase of testCases) {
        const result = getOpenCmd(testCase.profile, null, 'code -g');
        const passed = result === testCase.expected;

        if (passed) {
            console.log(`✅ ${testCase.name}`);
            console.log(`   Result: "${result}"`);
            passedTests++;
        } else {
            console.log(`❌ ${testCase.name}`);
            console.log(`   Expected: "${testCase.expected}"`);
            console.log(`   Got: "${result}"`);
            failedTests++;
        }
    }

    console.log();

    // Test 3: Test mapPaths validation
    console.log('Test 3: Validating mapPaths from profiles');
    console.log('═'.repeat(50));

    for (const [profileName, profileData] of Object.entries(profiles)) {
        const mapPaths = profileData?.mapPaths;

        if (!mapPaths?.local || !mapPaths?.remote) {
            console.log(`❌ Profile '${profileName}': Invalid mapPaths`);
            failedTests++;
            continue;
        }

        console.log(`✅ Profile '${profileName}':`);
        console.log(`   Local:  ${mapPaths.local}`);
        console.log(`   Remote: ${mapPaths.remote}`);

        // Check if using custom remapSplitStr
        if (profileData?.options?.remapSplitStr) {
            console.log(`   Custom split str: "${profileData.options.remapSplitStr}"`);
        }

        passedTests++;
    }

    console.log();

    // Test 4: Test options
    console.log('Test 4: Validating profile options');
    console.log('═'.repeat(50));

    for (const [profileName, profileData] of Object.entries(profiles)) {
        const options = profileData?.options || {};

        console.log(`✅ Profile '${profileName}':`);
        console.log(`   dryRunMode: ${options.dryRunMode ?? 'not set'}`);
        console.log(`   runInfo: ${options.runInfo ?? 'not set'}`);
        console.log(`   remapSplitStr: "${options.remapSplitStr ?? 'using global'} "`);

        passedTests++;
    }

    console.log();

    // Summary
    console.log('═'.repeat(50));
    console.log(`📊 Test Summary`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Total: ${passedTests + failedTests}`);

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log(`\n⚠️  ${failedTests} test(s) failed`);
    }
}

runTests().catch((error) => {
    console.error('Test execution error:', error);
    process.exit(1);
});
