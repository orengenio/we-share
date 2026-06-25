export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">WeShare</h1>
          <p className="text-blue-200 text-sm mt-1">OrenGen Affiliate & Partner Portal</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">{children}</div>
        <p className="text-center text-blue-200 text-xs mt-6">
          © {new Date().getFullYear()} OrenGen Worldwide LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
