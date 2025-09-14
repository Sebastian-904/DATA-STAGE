import React from 'react';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-blue-200 hover:bg-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 dark:focus:ring-offset-gray-900 focus:ring-white transition-colors duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <i className="fas fa-moon text-xl"></i>
            ) : (
                <i className="fas fa-sun text-xl"></i>
            )}
        </button>
    );
};
