import React, { useCallback, useMemo, useState } from 'react';
import { DashboardView } from './components/dashboard/DashboardView';
import { Header } from './components/layout/Header';
import { Sidebar, type TabType } from './components/layout/Sidebar';
import { LogsView } from './components/logs/LogsView';
import { PolicyListView } from './components/policies/PolicyListView';
import { PolicyModal } from './components/policies/PolicyModal';
import { TrafficSimulatorView } from './components/simulator/TrafficSimulatorView';
import type { FirewallPolicy, TrafficLog } from './types/firewall';
import {
  clearLogs as storageClearLogs,
  loadLogs,
  loadPolicies,
  resetPoliciesToDefault,
  saveLogs,
  savePolicies,
} from './utils/storage';

export const App: React.FC = () => {
  const [policies, setPolicies] = useState<FirewallPolicy[]>(loadPolicies);
  const [logs, setLogs] = useState<TrafficLog[]>(loadLogs);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Policy Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<FirewallPolicy | null>(null);

  // Memoized handlers
  const handleOpenAddModal = useCallback(() => {
    setEditingPolicy(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((policy: FirewallPolicy) => {
    setEditingPolicy(policy);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSavePolicy = useCallback(
    (policyData: Omit<FirewallPolicy, 'id' | 'hitCount'> & { id?: number }) => {
      setPolicies((prevPolicies) => {
        let updated: FirewallPolicy[];
        if (policyData.id) {
          updated = prevPolicies.map((p) =>
            p.id === policyData.id ? { ...p, ...policyData } : p
          );
        } else {
          const maxId = prevPolicies.reduce((max, p) => Math.max(max, p.id), 0);
          const newPolicy: FirewallPolicy = {
            ...policyData,
            id: maxId + 1,
            hitCount: 0,
          };
          updated = [newPolicy, ...prevPolicies];
        }
        savePolicies(updated);
        return updated;
      });
    },
    []
  );

  const handleDeletePolicy = useCallback((id: number) => {
    setPolicies((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePolicies(updated);
      return updated;
    });
  }, []);

  const handleTogglePolicy = useCallback((id: number) => {
    setPolicies((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      );
      savePolicies(updated);
      return updated;
    });
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setPolicies((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      savePolicies(updated);
      return updated;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setPolicies((prev) => {
      if (index >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      savePolicies(updated);
      return updated;
    });
  }, []);

  const handleResetDefaults = useCallback(() => {
    const defaults = resetPoliciesToDefault();
    setPolicies(defaults);
  }, []);

  const handleLogGenerated = useCallback((newLog: TrafficLog) => {
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      saveLogs(updated);
      return updated;
    });
  }, []);

  const handleAddBatchLogs = useCallback((batch: TrafficLog[]) => {
    setLogs((prev) => {
      const updated = [...batch, ...prev];
      saveLogs(updated);
      return updated;
    });
  }, []);

  const handleClearLogs = useCallback(() => {
    storageClearLogs();
    setLogs([]);
  }, []);

  const handleUpdatePolicyHits = useCallback((policyId: number) => {
    setPolicies((prev) => {
      const updated = prev.map((p) => {
        if (p.id === policyId) {
          return {
            ...p,
            hitCount: p.hitCount + 1,
            lastHit: 'Just now',
          };
        }
        return p;
      });
      savePolicies(updated);
      return updated;
    });
  }, []);

  const nextId = useMemo(
    () => policies.reduce((max, p) => Math.max(max, p.id), 0) + 1,
    [policies]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col cyber-grid-bg">
      {/* FortiOS Top Header */}
      <Header
        onQuickSimulate={() => setActiveTab('simulator')}
        onResetDefaults={handleResetDefaults}
        logs={logs}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          policyCount={policies.length}
          logCount={logs.length}
        />

        {/* Dynamic Center Stage Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              policies={policies}
              logs={logs}
              onNavigateToSimulator={() => setActiveTab('simulator')}
              onNavigateToPolicies={() => setActiveTab('policies')}
              onNavigateToLogs={() => setActiveTab('logs')}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyListView
              policies={policies}
              onAddPolicy={handleOpenAddModal}
              onEditPolicy={handleOpenEditModal}
              onDeletePolicy={handleDeletePolicy}
              onTogglePolicy={handleTogglePolicy}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          )}

          {activeTab === 'simulator' && (
            <TrafficSimulatorView
              policies={policies}
              onLogGenerated={handleLogGenerated}
              onUpdatePolicyHits={handleUpdatePolicyHits}
            />
          )}

          {activeTab === 'logs' && (
            <LogsView
              logs={logs}
              policies={policies}
              onClearLogs={handleClearLogs}
              onAddLogs={handleAddBatchLogs}
              onUpdatePolicyHits={handleUpdatePolicyHits}
            />
          )}
        </main>
      </div>

      {/* Modal for Add / Edit Policy */}
      <PolicyModal
        isOpen={isModalOpen}
        policy={editingPolicy}
        onClose={handleCloseModal}
        onSave={handleSavePolicy}
        nextId={nextId}
      />
    </div>
  );
};

export default App;
