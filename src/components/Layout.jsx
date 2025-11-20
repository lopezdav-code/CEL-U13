import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, Shield, Image, BarChart2, LogOut, Menu, X, BrainCircuit, User as UserIcon, Book, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { to: '/', text: 'Accueil', icon: Home },
  { to: '/joueuses', text: 'Joueuses', icon: Users },
  { to: '/matchs', text: 'Matchs', icon: Shield },
  { to: '/photos', text: 'Photos', icon: Image },
  { to: '/statistiques', text: 'Statistiques', icon: BarChart2 },
  { to: '/quiz', text: 'Quiz', icon: BrainCircuit },
];

const Layout = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg text-gray-800">U13 F-ESTL</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4">
          <ul>
            {navLinks.map(({ to, text, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {text}
                </NavLink>
              </li>
            ))}
          </ul>

          {profile?.role === 'admin' && (
            <>
              <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </div>
              <ul>
                <li>
                  <NavLink
                    to="/admin-clubs"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Clubs
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin-users"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <Users className="mr-3 h-5 w-5" />
                    Utilisateurs
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin-docs"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <Book className="mr-3 h-5 w-5" />
                    Documentation
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin-specs"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <BookOpen className="mr-3 h-5 w-5" />
                    Spécifications
                  </NavLink>
                </li>
              </ul>
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>

              {/* Logo for mobile */}
              <div className="lg:hidden">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                </Link>
              </div>

              {/* Spacer on desktop */}
              <div className="hidden lg:block flex-1" />

              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.name || user?.email} />
                        <AvatarFallback>{getInitials(profile?.name || user?.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.name || 'Utilisateur'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {profile?.role === 'admin' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin-clubs')}>Gestion des clubs</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin-users')}>Gestion des utilisateurs</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin-docs')}>Documentation technique</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin-specs')}>Spécifications fonctionnelles</DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200">
              <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map(({ to, text, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {text}
                  </NavLink>
                ))}

                {profile?.role === 'admin' && (
                  <>
                    <div className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Administration
                    </div>
                    <NavLink
                      to="/admin-clubs"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <Settings className="mr-3 h-6 w-6" />
                      Clubs
                    </NavLink>
                    <NavLink
                      to="/admin-users"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <Users className="mr-3 h-6 w-6" />
                      Utilisateurs
                    </NavLink>
                    <NavLink
                      to="/admin-docs"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <Book className="mr-3 h-6 w-6" />
                      Documentation
                    </NavLink>
                    <NavLink
                      to="/admin-specs"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <BookOpen className="mr-3 h-6 w-6" />
                      Spécifications
                    </NavLink>
                  </>
                )}
              </nav>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;