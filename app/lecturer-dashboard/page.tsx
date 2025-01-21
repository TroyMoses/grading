import { UserButton } from "@clerk/nextjs"

export default function LecturerDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <p>Welcome to your lecturer dashboard. Use the sidebar to navigate.</p>
    </div>
  )
}

