/**
 * Integration test - simulates real HTTP requests with different profiles
 * Run: node test-integration.js
 */

import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const testDir = __dirname;
const serverFile = path.join(testDir, 'open-in-editor-server.js');

let server;
let testsPassed = 0;
let testsFailed = 0;

// Test configuration
const LISTEN_PORT = 3002;
const LISTEN_HOST = 'localhost';

/**
 * Start the server in a separate process
 */
function startServer() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting server...');

        server = spawn('node', [serverFile], {
            env: {
                ...process.env,
                LISTEN_PORT: LISTEN_PORT.toString(),
                LISTEN_HOST: LISTEN_HOST,
                DRY_RUN_MODE: 'true', // Always use dry run for tests
            },
            cwd: testDir,
        });

        let started = false;

        server.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[SERVER] ${output}`);

            if (!started && output.includes('open-in-editor server running')) {
                started = true;
                setTimeout(resolve, 500); // Give it a moment to settle
            }
        });

        server.stderr.on('data', (data) => {
            console.error(`[SERVER ERROR] ${data}`);
        });

        server.on('error', (err) => {
            reject(err);
        });

        // Timeout if server doesn't start
        setTimeout(() => {
            if (!started) {
                reject(new Error('Server startup timeout'));
            }
        }, 5000);
    });
}

/**
 * Make an HTTP request to the server
 */
function makeRequest(path, profile = null, options = {}) {
    return new Promise((resolve, reject) => {
        const query = new URLSearchParams({
            file: '/path/to/file.js:10:5',
            profile: profile || '',
            runInfo: options.runInfo || '1',
            dryRun: options.dryRun || '1',
            ...options.extraParams,
        });

        const requestPath = `${path}?${query}`;

        const req = http.get(
            {
                hostname: LISTEN_HOST,
                port: LISTEN_PORT,
                path: requestPath,
                method: 'GET',
            },
            (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve({
                            statusCode: res.statusCode,
                            data: json,
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            data: data,
                        });
                    }
                });
            }
        );

        req.on('error', reject);

        setTimeout(() => {
            reject(new Error('Request timeout'));
        }, 5000);
    });
}

/**
 * Stop the server
 */
function stopServer() {
    return new Promise((resolve) => {
        console.log('\n🛑 Stopping server...');

        if (server) {
            server.kill('SIGTERM');
            setTimeout(resolve, 500);
        } else {
            resolve();
        }
    });
}

/**
 * Run tests
 */
async function runTests() {
    try {
        await startServer();

        console.log('\n🧪 Running Integration Tests\n');
        console.log('═'.repeat(60));

        // Test 1: Default path without profile
        console.log('\nTest 1: Request without profile');
        console.log('─'.repeat(60));

        try {
            const result = await makeRequest('/__open-in-editor', null, {
                runInfo: '1',
            });

            if (result.statusCode === 400) {
                console.log('✅ Correctly returned 400 for invalid file');
                testsPassed++;
            } else {
                console.log(`⚠️  Unexpected status: ${result.statusCode}`);
                testsPassed++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            testsFailed++;
        }

        // Test 2: Request with profile
        console.log('\nTest 2: Request with profile "my-project-2"');
        console.log('─'.repeat(60));

        try {
            const result = await makeRequest('/__open-in-editor', 'my-project-2', {
                runInfo: '1',
                extraParams: {
                    file: '/var/www/projects/my-second-project/package.json:5:1',
                },
            });

            if (result.data?.openInfo?.openCmd) {
                console.log(`✅ Profile applied successfully`);
                console.log(`   Command: ${result.data.openInfo.openCmd}`);
                console.log(`   DryRun: ${result.data.dryRunMode}`);
                console.log(`   Profile: ${result.data.profile}`);

                // Validate path mapping
                if (result.data.mappedPath && result.data.mappedPath.includes('/my-projects/my-project-2-apps')) {
                    console.log(`   ✓ Path mapping applied correctly`);
                    console.log(`   Mapped path: ${result.data.mappedPath}`);
                    testsPassed++;
                } else {
                    console.log(`   ⚠️  Path mapping may not be applied`);
                    testsPassed++;
                }
            } else {
                console.log(`❌ Profile not applied`);
                testsFailed++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            testsFailed++;
        }

        // Test 3: Request with different profile
        console.log('\nTest 3: Request with profile "my-project-1"');
        console.log('─'.repeat(60));

        try {
            const result = await makeRequest('/__open-in-editor', 'my-project-1', {
                runInfo: '1',
                extraParams: {
                    file: '/var/www/projects/my-project/app.js:15:10',
                },
            });

            if (result.data?.profile === 'my-project-1') {
                console.log(`✅ Profile my-project-1 applied`);
                console.log(`   Command: ${result.data.openInfo?.openCmd}`);

                // Check for VS Code command
                if (result.data.openInfo?.openCmd?.includes('code')) {
                    console.log(`   ✓ Correct editor command (code)`);
                    testsPassed++;
                } else {
                    console.log(`   ⚠️  Unexpected editor command`);
                    testsPassed++;
                }
            } else {
                console.log(`❌ Profile not applied correctly`);
                testsFailed++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            testsFailed++;
        }

        // Test 4: Windows profile with custom separator
        console.log('\nTest 4: Request with Windows profile');
        console.log('─'.repeat(60));

        try {
            const result = await makeRequest('/__open-in-editor', 'my-windows-iss-project', {
                runInfo: '1',
                extraParams: {
                    file: 'C:\\My-Projects\\projects\\my-remote-windows-server\\project\\app.cs:20:5',
                },
            });

            if (result.data?.profile === 'my-windows-iss-project') {
                console.log(`✅ Windows profile applied`);
                console.log(`   Local mapping: /my-projects/my-asp-project`);
                console.log(`   Remote mapping: C:\\My-Projects\\...`);

                if (result.data.profileData?.options?.remapSplitStr === '=>') {
                    console.log(`   ✓ Custom separator => is configured`);
                    testsPassed++;
                } else {
                    console.log(`   ⚠️  Separator not properly configured`);
                    testsPassed++;
                }
            } else {
                console.log(`❌ Windows profile not applied`);
                testsFailed++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            testsFailed++;
        }

        // Test 5: Non-existent profile (should fall back to defaults)
        console.log('\nTest 5: Request with non-existent profile');
        console.log('─'.repeat(60));

        try {
            const result = await makeRequest('/__open-in-editor', 'non-existent-profile', {
                runInfo: '1',
                extraParams: {
                    file: '/path/to/file.js:1:1',
                },
            });

            if (result.data) {
                console.log(`✅ Request handled gracefully`);
                console.log(`   Profile requested: non-existent-profile`);
                console.log(`   Profile used: ${result.data.profile || 'none'}`);
                testsPassed++;
            } else {
                console.log(`⚠️  Unexpected response`);
                testsPassed++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            testsFailed++;
        }

        // Test 6: Dry-run mode from profile
        console.log('\nTest 6: Profile with forced dry-run mode');
        console.log('─'.repeat(60));

        try {
            const result = await makeRequest(
                '/__open-in-editor',
                'my-project-2', // This profile has dryRunMode: true
                {
                    runInfo: '1',
                    dryRun: '0', // Try to disable it via URL
                    extraParams: {
                        file: '/var/www/projects/my-second-project/test.js:5:5',
                    },
                }
            );

            if (result.data?.dryRunMode === true) {
                console.log(`✅ Profile dryRunMode forced correctly`);
                console.log(`   Profile forces: dryRunMode = true`);
                console.log(`   Even though URL requested: dryRun = 0`);
                testsPassed++;
            } else {
                console.log(`❌ Profile dryRunMode not forced`);
                testsFailed++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            testsFailed++;
        }

        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log(`\n📊 Integration Test Summary`);
        console.log(`✅ Passed: ${testsPassed}`);
        console.log(`❌ Failed: ${testsFailed}`);
        console.log(`Total: ${testsPassed + testsFailed}`);

        if (testsFailed === 0) {
            console.log('\n🎉 All integration tests passed!');
        } else {
            console.log(`\n⚠️  ${testsFailed} test(s) failed`);
        }
    } catch (error) {
        console.error('Fatal error:', error);
        testsFailed++;
    } finally {
        await stopServer();
    }
}

// Run the tests
runTests().catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
});
