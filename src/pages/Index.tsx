import { useState, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import HomeScreen from '@/components/HomeScreen';
import CalendarScreen from '@/components/CalendarScreen';
import StatsScreen from '@/components/StatsScreen';
import SettingsScreen from '@/components/SettingsScreen';
import TimerSetup from '@/components/TimerSetup';
import ActiveSession from '@/components/ActiveSession';
import SessionComplete from '@/components/SessionComplete';
import { TimerConfig } from '@/lib/types';
import { recordSession, getData } from '@/lib/store';

type Screen = 'tabs' | 'timer-setup' | 'active-session' | 'session-complete';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState<Screen>('tabs');
  const [timerConfig, setTimerConfig] = useState<TimerConfig | null>(null);
  const [lastSessionMinutes, setLastSessionMinutes] = useState(0);
  const [lastSessionQualified, setLastSessionQualified] = useState(false);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate(n => n + 1);

  const handleStartWithConfig = useCallback((config: TimerConfig) => {
    setTimerConfig(config);
    setScreen('active-session');
  }, []);

  const handleTimerSetupStart = useCallback((config: TimerConfig) => {
    setTimerConfig(config);
    setScreen('active-session');
  }, []);

  const handleFinish = useCallback((elapsedSeconds: number) => {
    if (!timerConfig) return;
    const mins = Math.floor(elapsedSeconds / 60);
    const session = recordSession(mins, elapsedSeconds, timerConfig);
    setLastSessionMinutes(mins);
    setLastSessionQualified(session.qualifiedForDayCredit);
    setScreen('session-complete');
  }, [timerConfig]);

  const handleDiscard = useCallback(() => {
    setScreen('tabs');
    setTimerConfig(null);
  }, []);

  const handleContinue = useCallback(() => {
    setScreen('tabs');
    setTimerConfig(null);
    refresh();
  }, []);

  if (screen === 'timer-setup') {
    return <TimerSetup onStart={handleTimerSetupStart} onBack={() => setScreen('tabs')} />;
  }

  if (screen === 'active-session' && timerConfig) {
    return <ActiveSession config={timerConfig} onFinish={handleFinish} onDiscard={handleDiscard} />;
  }

  if (screen === 'session-complete') {
    return <SessionComplete durationMinutes={lastSessionMinutes} qualified={lastSessionQualified} onContinue={handleContinue} />;
  }

  return (
    <div className="mx-auto max-w-md">
      {activeTab === 'home' && (
        <HomeScreen onStartWithConfig={handleStartWithConfig} onOpenTimerSetup={() => setScreen('timer-setup')} />
      )}
      {activeTab === 'calendar' && <CalendarScreen />}
      {activeTab === 'stats' && <StatsScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
