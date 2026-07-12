import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RocketLaunch, Moon, Sun, X, List } from '@phosphor-icons/react';

function App() {
  const [theme, setTheme] = useState('cupcake');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'cupcake' ? 'night' : 'cupcake';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-8 font-sans transition-colors duration-300" data-theme={theme}>
      <div className="navbar bg-base-200 rounded-box mb-8 shadow-sm">
        <div className="flex-none">
          <button className="btn btn-square btn-ghost" onClick={() => setIsSidebarOpen(true)}>
            <List size={24} weight="duotone" />
          </button>
        </div>
        <div className="flex-1">
          <a className="btn btn-ghost text-xl font-bold flex items-center gap-2">
            <RocketLaunch size={28} weight="duotone" className="text-primary" />
            Transitops
          </a>
        </div>
        <div className="flex-none">
          <button className="btn btn-square btn-ghost" onClick={toggleTheme}>
            {theme === 'cupcake' ? (
              <Moon size={24} weight="duotone" />
            ) : (
              <Sun size={24} weight="duotone" />
            )}
          </button>
        </div>
      </div>

      <div className="hero bg-base-200 rounded-box p-12 text-center shadow-lg">
        <div className="max-w-md mx-auto">
          <h1 className="text-5xl font-bold mb-6">Hello there!</h1>
          <p className="mb-6 text-lg">
            This project is set up with Vite, React 19, Tailwind CSS v4, DaisyUI v5, Phosphor Icons, and Motion.
            Buttons are pill-shaped by default using DaisyUI config.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-primary">Primary Action</button>
            <button className="btn btn-secondary btn-outline">Secondary</button>
          </div>
        </div>
      </div>

      {/* Sidebar with Motion */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-base-100 z-50 p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button className="btn btn-ghost btn-square" onClick={() => setIsSidebarOpen(false)}>
                  <X size={24} weight="duotone" />
                </button>
              </div>
              <ul className="menu bg-base-200 rounded-box w-full">
                <li><a>Item 1</a></li>
                <li><a>Item 2</a></li>
                <li><a>Item 3</a></li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
