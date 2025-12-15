import React from 'react';
import { Outlet } from 'react-router-dom';
// ...ikonka va nav importlari, UserMenu, NavLink importlari kerak bo'lsa shu yerda import qiling...

export default function MainLayout() {
  // ...nav, footer, usermenu va boshqalar...
  return (
    <div className="app">
      {/* Navbar, nav, footer va Outlet */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
