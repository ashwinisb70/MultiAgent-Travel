import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-brand-dark text-text-primary">
      <Sidebar />
      <TopNav />
      <main className="ml-64 mt-16">
        <Outlet />
      </main>
    </div>
  )
}
