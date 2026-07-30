import { Outlet, NavLink } from 'react-router-dom';

const NavItem = ({ to, icon, label, isMobile }) => {
  if (isMobile) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={isActive ? "px-4 py-1 bg-secondary-container rounded-full mb-1" : "mb-1"}>
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
            </div>
            <span className={`font-label-caps text-[10px] ${isActive ? "font-bold" : ""}`}>
              {label}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
          isActive
            ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
            : "text-on-surface-variant hover:bg-surface-container-high"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`material-symbols-outlined transition-colors duration-200 ${
              isActive ? "" : "group-hover:text-primary"
            }`}
            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon}
          </span>
          <span className="font-label-caps text-label-caps mt-1">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default function Layout({ displayData }) {
  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex flex-col md:flex-row antialiased overflow-x-hidden">
      {/* TopNavBar (Mobile Only) */}
      <header className="md:hidden fixed top-0 left-0 w-full z-40 flex justify-between items-center px-container-padding h-16 bg-surface/70 backdrop-blur-xl shadow-sm shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]">
        <div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary tracking-tight">
          OUR HOME AIOT
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">sync</span>
          <span className="material-symbols-outlined text-primary">notifications</span>
          <span className="material-symbols-outlined text-primary">settings</span>
        </div>
      </header>

      {/* SideNavBar (Desktop Only) */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 z-50 flex-col p-base border-r border-outline-variant/30 bg-surface/70 backdrop-blur-xl shadow-md shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-2 p-4 mb-8">
          <h1 className="font-headline-lg text-[24px] font-bold text-primary tracking-tight leading-tight">
            OUR HOME AIOT
          </h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">
            Intelligent Systems
          </p>
        </div>
        
        <div className="flex flex-col gap-2 flex-grow px-2">
          <NavItem to="/" icon="dashboard" label="Dashboard" />
          <NavItem to="/atmosphere" icon="cloud" label="Atmosphere" />
          <NavItem to="/gardens" icon="local_florist" label="Gardens" />
          <NavItem to="/insights" icon="psychology" label="Insights" />
        </div>

        <div className="px-2 pb-4 mt-auto">
          <button className="w-full mb-6 bg-gradient-to-r from-primary-container to-[#059669] text-white font-label-caps text-label-caps py-3 rounded-full hover:shadow-lg transition-shadow duration-300 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Zone
          </button>
          <div className="border-t border-outline-variant/30 pt-4 space-y-1">
            <a className="flex items-center gap-4 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors duration-200" href="#">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="font-label-caps text-label-caps mt-1">Support</span>
            </a>
            <a className="flex items-center gap-4 px-4 py-2 rounded-lg text-error hover:bg-error-container transition-colors duration-200" href="#">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-label-caps text-label-caps mt-1">Logout</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-64 pt-20 md:pt-8 px-4 md:px-container-padding max-w-[1440px] mx-auto pb-24 w-full flex-1">
        <Outlet context={{ displayData }} />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-lg border-t border-outline-variant/20 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavItem to="/" icon="dashboard" label="Dashboard" isMobile />
          <NavItem to="/atmosphere" icon="cloud" label="Atmosphere" isMobile />
          <NavItem to="/gardens" icon="local_florist" label="Gardens" isMobile />
          <NavItem to="/insights" icon="psychology" label="Insights" isMobile />
        </div>
      </nav>
    </div>
  );
}
