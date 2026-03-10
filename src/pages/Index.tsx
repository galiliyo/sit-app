import BottomNav from '@/components/BottomNav';
import {
  HomeScreen,
  CalendarScreen,
  StatsScreen,
  SettingsScreen,
  TimerSetupScreen,
  ActiveSessionScreen,
  SessionCompleteScreen,
} from '@/screens';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const Index = () => {
  const nav = useAppNavigation();

  if (nav.screen === 'timer-setup') {
    return <TimerSetupScreen onStart={nav.startSession} onBack={nav.goToTabs} />;
  }

  if (nav.screen === 'active-session' && nav.timerConfig) {
    return <ActiveSessionScreen config={nav.timerConfig} onFinish={nav.finishSession} onDiscard={nav.discardSession} />;
  }

  if (nav.screen === 'session-complete') {
    return <SessionCompleteScreen durationMinutes={nav.lastSessionMinutes} qualified={nav.lastSessionQualified} onContinue={nav.continueAfterComplete} />;
  }

  return (
    <div className="mx-auto max-w-md">
      {nav.activeTab === 'home' && (
        <HomeScreen onStartWithConfig={nav.startSession} onOpenTimerSetup={nav.openTimerSetup} />
      )}
      {nav.activeTab === 'calendar' && <CalendarScreen />}
      {nav.activeTab === 'stats' && <StatsScreen />}
      {nav.activeTab === 'settings' && <SettingsScreen />}
      <BottomNav activeTab={nav.activeTab} onTabChange={(tab) => nav.switchTab(tab as any)} />
    </div>
  );
};

export default Index;
