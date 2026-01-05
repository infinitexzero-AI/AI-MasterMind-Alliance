'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Globe, MessageSquare, Shield, Cpu, Terminal } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'OVERVIEW', href: '/', icon: Home },
  { name: 'VALENTINE', href: '/agents/valentine', icon: User },
  { name: 'COMET', href: '/agents/comet', icon: Globe },
  { name: 'CHATGPT', href: '/agents/chatgpt', icon: MessageSquare },
  { name: 'GEMINI', href: '/agents/gemini', icon: MessageSquare },
  { name: 'ANTIGRAVITY', href: '/agents/antigravity', icon: Cpu },
  { name: 'COMMANDS', href: '/commands', icon: Terminal },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="h-full border-r border-cyan-900/30 bg-slate-950/50 p-4 flex flex-col gap-2">
       <div className="mb-8 pl-2 flex items-center gap-2 text-cyan-400">
          <Shield className="w-6 h-6" />
          <span className="font-bold tracking-widest hidden md:block">ALLIANCE</span>
       </div>
       
       {navItems.map((item) => {
         const isActive = pathname === item.href;
         const Icon = item.icon;
         return (
           <Link 
             key={item.name} 
             href={item.href}
             className={clsx(
               "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-mono text-sm",
               isActive 
                 ? "bg-cyan-900/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30" 
                 : "text-cyan-600 hover:text-cyan-300 hover:bg-cyan-900/20"
             )}
           >
             <Icon className="w-5 h-5" />
             <span className="hidden md:block tracking-wider">{item.name}</span>
           </Link>
         );
       })}
    </nav>
  );
}
