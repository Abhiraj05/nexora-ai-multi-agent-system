import './globals.css';
export const metadata={title:'Nexora AI',description:'AI-powered research reports'};
// Render the shared application layout.
export default function RootLayout({children}){return <html lang="en"><body><div className="app-background" aria-hidden="true"><div className="absolute inset-0 bg-slate-950"></div><div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/20 blur-[120px] mix-blend-screen" /><div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" /></div><div className="app-content">{children}</div></body></html>}
