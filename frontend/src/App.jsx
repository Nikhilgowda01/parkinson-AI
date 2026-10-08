import { useVoiceApp } from './context/VoiceAppContext'
import ParticleBackground from './components/background/ParticleBackground'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import Footer from './components/common/Footer'
import OverviewTab from './components/dashboard/OverviewTab'
import VoiceLabTab from './components/dashboard/VoiceLabTab'
import AIInsightsTab from './components/dashboard/AIInsightsTab'
import HistoryTab from './components/dashboard/HistoryTab'
import SettingsTab from './components/dashboard/SettingsTab'
import PatientsTab from './components/dashboard/PatientsTab'
import AuthPage from './components/auth/AuthPage'

function AppContent() {
  const { activeTab, authUser } = useVoiceApp()

  if (!authUser) return <AuthPage />

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab />
      case 'VoiceLab':
        return <VoiceLabTab />
      case 'Insights':
        return <AIInsightsTab />
      case 'Sessions':
        return <HistoryTab />
      case 'Patients':
        return <PatientsTab />
      case 'Settings':
      case 'Help':
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="app-shell-layout">
      {/* Dynamic Animated Particles Background */}
      <ParticleBackground />

      {/* Main App Grid */}
      <div className="app-grid">
        <Sidebar />
        <div className="app-main-content">
          <Header />
          <main className="view-viewport">
            {renderActiveView()}
          </main>
          <Footer />
        </div>
      </div>

      <style>{`
        .app-shell-layout {
          min-height: 100vh;
          width: 100%;
          position: relative;
          background: #070913;
        }

        .app-grid {
          display: flex;
          width: 100%;
          min-height: 100vh;
          position: relative;
          z-index: 10;
        }

        .app-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px 32px;
          max-width: 1440px;
          margin: 0 auto;
          min-width: 0;
        }

        .view-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1024px) {
          .app-grid {
            flex-direction: column;
          }
          .app-main-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
