import React, { useState } from 'react';
import { Bell, Plus, Trash2, Clock, Play, TrendingUp, AlertCircle } from 'lucide-react';
import { NotificationTrigger } from '../../types';

interface NotificationManagerProps {
  triggers: NotificationTrigger[];
  onTriggersChange: (triggers: NotificationTrigger[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationManager({ 
  triggers, 
  onTriggersChange, 
  isOpen, 
  onClose 
}: NotificationManagerProps) {
  const [newTrigger, setNewTrigger] = useState<Partial<NotificationTrigger>>({
    type: 'before',
    value: 5,
    enabled: true
  });

  if (!isOpen) return null;

  const addTrigger = () => {
    if (newTrigger.type && newTrigger.value !== undefined) {
      const trigger: NotificationTrigger = {
        id: crypto.randomUUID(),
        type: newTrigger.type,
        value: newTrigger.value,
        enabled: newTrigger.enabled || true
      };
      onTriggersChange([...triggers, trigger]);
      setNewTrigger({ type: 'before', value: 5, enabled: true });
    }
  };

  const removeTrigger = (id: string) => {
    onTriggersChange(triggers.filter(t => t.id !== id));
  };

  const toggleTrigger = (id: string) => {
    onTriggersChange(
      triggers.map(t => 
        t.id === id ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  const getTriggerIcon = (type: NotificationTrigger['type']) => {
    switch (type) {
      case 'before': return <Clock className="w-4 h-4" />;
      case 'start': return <Play className="w-4 h-4" />;
      case 'progress': return <TrendingUp className="w-4 h-4" />;
      case 'remaining': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = (trigger: NotificationTrigger) => {
    switch (trigger.type) {
      case 'before': return `開始${trigger.value}分前`;
      case 'start': return '開始時';
      case 'progress': return `進捗${trigger.value}%時`;
      case 'remaining': return `残り${trigger.value}分`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">通知設定</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 既存の通知 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">設定済み通知</h3>
            {triggers.length > 0 ? (
              <div className="space-y-2">
                {triggers.map(trigger => (
                  <div
                    key={trigger.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      trigger.enabled 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={trigger.enabled ? 'text-blue-600' : 'text-gray-400'}>
                        {getTriggerIcon(trigger.type)}
                      </div>
                      <span className={`font-medium ${
                        trigger.enabled ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {getTriggerLabel(trigger)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTrigger(trigger.id)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          trigger.enabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          trigger.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                      <button
                        onClick={() => removeTrigger(trigger.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">通知が設定されていません</p>
            )}
          </div>

          {/* 新しい通知を追加 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">新しい通知を追加</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  通知タイプ
                </label>
                <select
                  value={newTrigger.type}
                  onChange={(e) => setNewTrigger({ ...newTrigger, type: e.target.value as NotificationTrigger['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="before">開始前</option>
                  <option value="start">開始時</option>
                  <option value="progress">進捗時</option>
                  <option value="remaining">残り時間</option>
                </select>
              </div>

              {(newTrigger.type === 'before' || newTrigger.type === 'remaining') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    時間（分）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newTrigger.value}
                    onChange={(e) => setNewTrigger({ ...newTrigger, value: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {newTrigger.type === 'progress' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    進捗率（%）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newTrigger.value}
                    onChange={(e) => setNewTrigger({ ...newTrigger, value: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                onClick={addTrigger}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>通知を追加</span>
              </button>
            </div>
          </div>

          {/* Web Push設定 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Web Push通知</h4>
                <p className="text-sm text-gray-600">ブラウザ通知を有効にする</p>
              </div>
              <button
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                許可を要求
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}