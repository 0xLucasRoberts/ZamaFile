import { useState } from 'react';
import { Header } from './Header';
import { FileSubmission } from './FileSubmission';
import { FileList } from './FileList';
import '../styles/FileApp.css';

export function FileApp() {
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('submit');

  return (
    <div className="file-app">
      <Header />
      <main className="main-content">
        <div className="slide-up">
          <div className="tab-navigation">
            <nav className="tab-nav">
              <button
                onClick={() => setActiveTab('submit')}
                className={`tab-button ${activeTab === 'submit' ? 'active' : 'inactive'}`}
              >
                📤 Submit File
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`tab-button ${activeTab === 'list' ? 'active' : 'inactive'}`}
              >
                📁 My Files
              </button>
            </nav>
          </div>

          <div className="fade-in">
            {activeTab === 'submit' && <FileSubmission />}
            {activeTab === 'list' && <FileList />}
          </div>
        </div>
      </main>
    </div>
  );
}
