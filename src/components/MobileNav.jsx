import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Shield, Image, BarChart2, BrainCircuit } from 'lucide-react';

const navLinks = [
  { to: '/', text: 'Accueil', icon: Home },
  { to: '/joueuses', text: 'Joueuses', icon: Users },
  { to: '/matchs', text: 'Matchs', icon: Shield },
  { to: '/photos', text: 'Photos', icon: Image },
  { to: '/statistiques', text: 'Stats', icon: BarChart2 },
  { to: '/quiz', text: 'Quiz', icon: BrainCircuit },
];

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="grid grid-cols-6 h-16">
        {navLinks.map(({ to, text, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{text}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
