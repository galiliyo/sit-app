import { useState, useCallback } from 'react';
import { TimerConfig } from '@/lib/types';
import { recordSession } from '@/lib/store';

export type Screen = 'tabs' | 'timer-setup' | 'active-session' | 'session-complete';
export type TabId = 'home' | 'calendar' | 'stats' | 'settings';

export interface AppNavigationState {
  screen: Screen;
  activeTab: TabId;
  timerConfig: TimerConfig | null;
  lastSessionMinutes: number;
  lastSessionQualified: boolean;
}

export function useAppNavigation() {
  const [screen, setScreen] = useState<Screen>('tabs');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [timerConfig, setTimerConfig] = useState<TimerConfig | null>(null);
  const [lastSessionMinutes, setLastSessionMinutes] = useState(0);
  const [lastSessionQualified, setLastSessionQualified] = useState(false);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const startSession = useCallback((config: TimerConfig) => {
    setTimerConfig(config);
    setScreen('active-session');
  }, []);

  const openTimerSetup = useCallback(() => {
    setScreen('timer-setup');
  }, []);

  const goToTabs = useCallback(() => {
    setScreen('tabs');
    setTimerConfig(null);
  }, []);

  const finishSession = useCallback((elapsedSeconds: number) => {
    if (!timerConfig) return;
    const mins = Math.floor(elapsedSeconds / 60);
    const session = recordSession(mins, elapsedSeconds, timerConfig);
    setLastSessionMinutes(mins);
    setLastSessionQualified(session.qualifiedForDayCredit);
    setScreen('session-complete');
  }, [timerConfig]);

  const discardSession = useCallback(() => {
    goToTabs();
  }, [goToTabs]);

  const continueAfterComplete = useCallback(() => {
    goToTabs();
    refresh();
  }, [goToTabs, refresh]);

  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    refresh();
  }, [refresh]);

  return {
    screen,
    activeTab,
    timerConfig,
    lastSessionMinutes,
    lastSessionQualified,
    startSession,
    openTimerSetup,
    goToTabs,
    finishSession,
    discardSession,
    continueAfterComplete,
    switchTab,
  };
}
