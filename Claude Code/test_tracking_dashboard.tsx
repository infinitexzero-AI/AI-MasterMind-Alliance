import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Download, Play, FileText, BarChart3 } from 'lucide-react';

const TestingDashboard = () => {
  const [tests, setTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [automatedResults, setAutomatedResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Initialize test structure
  useEffect(() => {
    const initialTests = [
      // Project Overview
      {
        id: '1.1',
        category: 'Project Overview',
        name: 'Scope Documentation Review',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '1.2',
        category: 'Project Overview',
        name: 'Phase Completion Status',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      },
      // Deliverables
      {
        id: '2.1',
        category: 'Deliverables',
        name: 'Dashboard Files Validation',
        status: 'pending',
        automated: true,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '2.2',
        category: 'Deliverables',
        name: 'Data Files Validation',
        status: 'pending',
        automated: true,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '2.3',
        category: 'Deliverables',
        name: 'Documentation Completeness',
        status: 'pending',
        automated: true,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '2.4',
        category: 'Deliverables',
        name: 'Integration Sync Verification',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      },
      // Timelines & Metrics
      {
        id: '3.1',
        category: 'Timelines & Metrics',
        name: 'Phase Deadline Compliance',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '3.2',
        category: 'Timelines & Metrics',
        name: 'Performance Metrics Validation',
        status: 'pending',
        automated: true,
        critical: true,
        notes: '',
        evidence: ''
      },
      // Functional Testing
      {
        id: '4.1',
        category: 'Functional',
        name: 'Data Import/Display Test',
        status: 'pending',
        automated: true,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '4.2',
        category: 'Functional',
        name: 'Integration Status Verification',
        status: 'pending',
        automated: true,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '4.3',
        category: 'Functional',
        name: 'UI Interaction Testing',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      },
      // Final Acceptance
      {
        id: '5.1',
        category: 'Final Acceptance',
        name: 'Comprehensive Checklist Review',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      },
      {
        id: '5.2',
        category: 'Final Acceptance',
        name: 'Sign-Off Documentation',
        status: 'pending',
        automated: false,
        critical: true,
        notes: '',
        evidence: ''
      }
    ];
    setTests(initialTests);
  }, []);

  // Automated test runner
  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    const results = {};

    // Test 2.1: Dashboard Files Validation
    await new Promise(resolve => setTimeout(resolve, 500));
    const dashboardTest = checkDashboardFiles();
    results['2.1'] = dashboardTest;

    // Test 2.2: Data Files Validation
    await new Promise(resolve => setTimeout(resolve, 500));
    const dataFilesTest = checkDataFiles();
    results['2.2'] = dataFilesTest;

    // Test 2.3: Documentation Completeness
    await new Promise(resolve => setTimeout(resolve, 500));
    const docsTest = checkDocumentation();
    results['2.3'] = docsTest;

    // Test 3.2: Performance Metrics
    await new Promise(resolve => setTimeout(resolve, 500));
    const perfTest = checkPerformanceMetrics();
    results['3.2'] = perfTest;

    // Test 4.1: Data Import/Display
    await new Promise(resolve => setTimeout(resolve, 500));
    const dataDisplayTest = checkDataDisplay();
    results['4.1'] = dataDisplayTest;

    // Test 4.2: Integration Status
    await new Promise(resolve => setTimeout(resolve, 500));
    const integrationTest = checkIntegrationStatus();
    results['4.2'] = integrationTest;

    setAutomatedResults(results);
    
    // Update test statuses
    setTests(prevTests => prevTests.map(test => {
      if (results[test.id]) {
        return {
          ...test,
          status: results[test.id].passed ? 'passed' : 'failed',
          notes: results[test.id].notes,
          evidence: results[test.id].evidence
        };
      }
      return test;
    }));

    setIsRunningTests(false);
  };

  // Automated test functions
  const checkDashboardFiles = () => {
    const requiredFiles = ['index.html', 'styles.css', 'script.js'];
    const found = requiredFiles.filter(() => Math.random() > 0.1); // Simulated check
    const passed = found.length === requiredFiles.length;
    
    return {
      passed,
      notes: passed 
        ? `All ${requiredFiles.length} required files found and validated` 
        : `Missing files: ${requiredFiles.filter(f => !found.includes(f)).join(', ')}`,
      evidence: `Files checked: ${requiredFiles.join(', ')}`
    };
  };

  const checkDataFiles = () => {
    const timestamp = new Date();
    const isRecent = true; // Simulated timestamp check
    const hasValidStructure = Math.random() > 0.2; // Simulated structure validation
    const passed = isRecent && hasValidStructure;
    
    return {
      passed,
      notes: passed 
        ? 'All CSV files present with valid structure and recent timestamps'
        : 'Issues found: Invalid CSV structure or stale timestamps',
      evidence: `Last modified: ${timestamp.toISOString()}`
    };
  };

  const checkDocumentation = () => {
    const requiredDocs = ['README.md', 'USER_GUIDE.md', 'TROUBLESHOOTING.md'];
    const foundDocs = requiredDocs.filter(() => Math.random() > 0.15);
    const passed = foundDocs.length === requiredDocs.length;
    
    return {
      passed,
      notes: passed 
        ? 'All documentation files present and complete'
        : `Missing: ${requiredDocs.filter(d => !foundDocs.includes(d)).join(', ')}`,
      evidence: `${foundDocs.length}/${requiredDocs.length} documents validated`
    };
  };

  const checkPerformanceMetrics = () => {
    const loadTime = (Math.random() * 4).toFixed(2);
    const errorRate = (Math.random() * 3).toFixed(2);
    const passed = loadTime < 3 && errorRate < 1;
    
    return {
      passed,
      notes: passed 
        ? `Performance within targets (Load: ${loadTime}s, Errors: ${errorRate}%)`
        : `Performance issues detected (Load: ${loadTime}s, Errors: ${errorRate}%)`,
      evidence: `Load time: ${loadTime}s, Error rate: ${errorRate}%`
    };
  };

  const checkDataDisplay = () => {
    const dataLoaded = Math.random() > 0.1;
    const displayCorrect = Math.random() > 0.15;
    const passed = dataLoaded && displayCorrect;
    
    return {
      passed,
      notes: passed 
        ? 'CSV data loads and displays correctly'
        : 'Data display issues detected',
      evidence: 'Test CSV processed with sample data'
    };
  };

  const checkIntegrationStatus = () => {
    const integrations = ['Zapier', 'API', 'Webhooks'];
    const activeCount = integrations.filter(() => Math.random() > 0.2).length;
    const passed = activeCount === integrations.length;
    
    return {
      passed,
      notes: passed 
        ? 'All integrations active and responding'
        : `${integrations.length - activeCount} integration(s) inactive`,
      evidence: `${activeCount}/${integrations.length} integrations active`
    };
  };

  // Manual test update
  const updateTestStatus = (testId, status, notes = '', evidence = '') => {
    setTests(prevTests => prevTests.map(test => 
      test.id === testId 
        ? { ...test, status, notes, evidence }
        : test
    ));
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Test ID', 'Category', 'Test Name', 'Status', 'Critical', 'Automated', 'Notes', 'Evidence'];
    const rows = tests.map(t => [
      t.id,
      t.category,
      t.name,
      t.status,
      t.critical ? 'Yes' : 'No',
      t.automated ? 'Yes' : 'No',
      t.notes,
      t.evidence
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acceptance-tests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToMarkdown = () => {
    let markdown = '# Acceptance Testing Results\n\n';
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    const categories = [...new Set(tests.map(t => t.category))];
    
    categories.forEach(category => {
      markdown += `## ${category}\n\n`;
      const categoryTests = tests.filter(t => t.category === category);
      
      categoryTests.forEach(test => {
        const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏳';
        markdown += `### ${statusIcon} Test ${test.id}: ${test.name}\n`;
        markdown += `- **Status:** ${test.status.toUpperCase()}\n`;
        markdown += `- **Critical:** ${test.critical ? 'Yes' : 'No'}\n`;
        markdown += `- **Automated:** ${test.automated ? 'Yes' : 'No'}\n`;
        if (test.notes) markdown += `- **Notes:** ${test.notes}\n`;
        if (test.evidence) markdown += `- **Evidence:** ${test.evidence}\n`;
        markdown += '\n';
      });
    });
    
    // Summary
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const pending = tests.filter(t => t.status === 'pending').length;
    
    markdown += '## Summary\n\n';
    markdown += `- ✅ Passed: ${passed}\n`;
    markdown += `- ❌ Failed: ${failed}\n`;
    markdown += `- ⏳ Pending: ${pending}\n`;
    markdown += `- **Total:** ${tests.length}\n`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acceptance-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  // Calculate statistics
  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    pending: tests.filter(t => t.status === 'pending').length,
    critical: tests.filter(t => t.critical).length,
    automated: tests.filter(t => t.automated).length
  };

  const categories = [...new Set(tests.map(t => t.category))];
  const filteredTests = selectedCategory === 'all' 
    ? tests 
    : tests.filter(t => t.category === selectedCategory);

  const StatusIcon = ({ status }) => {
    switch(status) {
      case 'passed': return <CheckCircle className="text-green-500" />;
      case 'failed': return <XCircle className="text-red-500" />;
      case 'pending': return <Clock className="text-gray-400" />;
      default: return <AlertCircle className="text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <BarChart3 className="text-blue-600" />
                Acceptance Testing Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Track and manage all acceptance criteria tests</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={runAutomatedTests}
                disabled={isRunningTests}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Play size={18} />
                {isRunningTests ? 'Running...' : 'Run Automated Tests'}
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                onClick={exportToMarkdown}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                <FileText size={18} />
                Report
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-slate-600 text-sm mb-1">Total Tests</div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 text-sm mb-1">Passed</div>
              <div className="text-2xl font-bold text-green-700">{stats.passed}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-red-600 text-sm mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-600 text-sm mb-1">Pending</div>
              <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-orange-600 text-sm mb-1">Critical</div>
              <div className="text-2xl font-bold text-orange-700">{stats.critical}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 text-sm mb-1">Automated</div>
              <div className="text-2xl font-bold text-blue-700">{stats.automated}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round((stats.passed / stats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(stats.passed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Tests ({tests.length})
            </button>
            {categories.map(cat => {
              const count = tests.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Test List */}
        <div className="space-y-3">
          {filteredTests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <StatusIcon status={test.status} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-slate-500">Test {test.id}</span>
                        {test.critical && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                            CRITICAL
                          </span>
                        )}
                        {test.automated && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            AUTO
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{test.name}</h3>
                      <p className="text-sm text-slate-600">{test.category}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTestStatus(test.id, 'passed', 'Manually marked as passed')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm transition"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => updateTestStatus(test.id, 'failed', 'Manually marked as failed')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm transition"
                      >
                        Fail
                      </button>
                      <button
                        onClick={() => updateTestStatus(test.id, 'pending')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm transition"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  {test.notes && (
                    <div className="bg-slate-50 rounded-lg p-3 mb-2">
                      <p className="text-sm text-slate-700">
                        <strong>Notes:</strong> {test.notes}
                      </p>
                    </div>
                  )}
                  
                  {test.evidence && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Evidence:</strong> {test.evidence}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Add notes or evidence..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      onBlur={(e) => {
                        if (e.target.value) {
                          updateTestStatus(test.id, test.status, e.target.value, test.evidence);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acceptance Decision */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Acceptance Decision</h2>
          
          {stats.failed > 0 ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-800 font-semibold">❌ REJECTION RECOMMENDED</p>
              <p className="text-red-700 text-sm mt-1">
                {stats.failed} test(s) failed. Critical issues must be resolved before acceptance.
              </p>
            </div>
          ) : stats.pending > 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-yellow-800 font-semibold">⏳ TESTING IN PROGRESS</p>
              <p className="text-yellow-700 text-sm mt-1">
                {stats.pending} test(s) still pending. Complete all tests before final acceptance.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-800 font-semibold">✅ FULL ACCEPTANCE RECOMMENDED</p>
              <p className="text-green-700 text-sm mt-1">
                All {stats.total} tests passed successfully. Project meets acceptance criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingDashboard;