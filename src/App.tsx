/**
 * HWX Gateway - Main Dashboard Application Entrypoint
 * State router for 15 operational pages, real Firebase Authentication, and responsive layout.
 */
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuth, logoutUser, testFirestoreConnection, AppUser } from './lib/firebase';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { Overview } from './pages/Overview';
import { Devices } from './pages/Devices';
import { AddDevice } from './pages/AddDevice';
import { SimManagement } from './pages/SimManagement';
import { SendSingleSms } from './pages/SendSingleSms';
import { BulkSms } from './pages/BulkSms';
import { SmsJobs } from './pages/SmsJobs';
import { BulkJobDetails } from './pages/BulkJobDetails';
import { SmsLogs } from './pages/SmsLogs';
import { ApiKeys } from './pages/ApiKeys';
import { ApiDocs } from './pages/ApiDocs';
import { ApiTestConsole } from './pages/ApiTestConsole';
import { UsageLimits } from './pages/UsageLimits';
import { AccountSettings } from './pages/AccountSettings';
import { AuditLogs } from './pages/AuditLogs';
import { api } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedBulkJobId, setSelectedBulkJobId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const [queuedJobsCount, setQueuedJobsCount] = useState(0);

  // Initialize and listen to Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Periodic metrics sync for sidebar badges
  const syncBadges = async () => {
    if (!user) return;
    try {
      const health = await api.getHealth().catch(() => null);
      if (health?.metrics) {
        setDeviceCount(health.metrics.totalDevices || 0);
        setQueuedJobsCount(health.metrics.queuedJobs || 0);
      }
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    syncBadges();
    const interval = setInterval(syncBadges, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentTab('overview');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-mono">Initializing HWX Gateway...</span>
      </div>
    );
  }

  // If not signed in, show Auth Portal
  if (!user) {
    return <AuthPage onSuccess={() => setAuthChecked(true)} />;
  }

  // Title map for Top Bar Breadcrumbs
  const titleMap: Record<NavTab, string> = {
    overview: 'Overview',
    devices: 'Connected Devices',
    'add-device': 'Pair Android Device',
    sims: 'SIM Management',
    'send-sms': 'Send Single SMS',
    'bulk-sms': 'Bulk SMS Dispatcher',
    jobs: 'SMS Jobs Queue',
    'bulk-details': 'Bulk Job Progress',
    logs: 'SMS Transmission Logs',
    keys: 'API Keys',
    docs: 'API Documentation',
    console: 'API Test Console',
    usage: 'Usage & Quotas',
    settings: 'Account Settings',
    audit: 'Security & Audit Logs',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        deviceCount={deviceCount}
        activeJobCount={queuedJobsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar Navigation */}
        <Navbar
          user={user}
          currentTitle={titleMap[currentTab]}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSignOut={handleSignOut}
          onNavigateToDocs={() => setCurrentTab('docs')}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && <Overview onNavigate={setCurrentTab} />}
          {currentTab === 'devices' && <Devices onNavigate={setCurrentTab} />}
          {currentTab === 'add-device' && <AddDevice onNavigate={setCurrentTab} />}
          {currentTab === 'sims' && <SimManagement onNavigate={setCurrentTab} />}
          {currentTab === 'send-sms' && (
            <SendSingleSms
              onNavigate={setCurrentTab}
              onViewJob={() => setCurrentTab('jobs')}
            />
          )}
          {currentTab === 'bulk-sms' && (
            <BulkSms
              onNavigate={setCurrentTab}
              onSelectBulkJob={(id) => {
                setSelectedBulkJobId(id);
                setCurrentTab('bulk-details');
              }}
            />
          )}
          {currentTab === 'jobs' && (
            <SmsJobs
              onNavigate={setCurrentTab}
              onSelectBulkJob={(id) => {
                setSelectedBulkJobId(id);
                setCurrentTab('bulk-details');
              }}
            />
          )}
          {currentTab === 'bulk-details' && (
            <BulkJobDetails
              bulkJobId={selectedBulkJobId}
              onNavigate={setCurrentTab}
            />
          )}
          {currentTab === 'logs' && (
            <SmsLogs
              onNavigate={setCurrentTab}
              onSelectBulkJob={(id) => {
                setSelectedBulkJobId(id);
                setCurrentTab('bulk-details');
              }}
            />
          )}
          {currentTab === 'keys' && <ApiKeys />}
          {currentTab === 'docs' && <ApiDocs />}
          {currentTab === 'console' && <ApiTestConsole />}
          {currentTab === 'usage' && <UsageLimits />}
          {currentTab === 'settings' && <AccountSettings />}
          {currentTab === 'audit' && <AuditLogs />}
        </main>
      </div>
    </div>
  );
}
