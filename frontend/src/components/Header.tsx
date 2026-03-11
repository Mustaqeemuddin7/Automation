"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Upload,
    Eye,
    Edit,
    FileText,
    Home,
    GraduationCap,
    BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Preview", href: "/preview", icon: Eye },
    { name: "Edit", href: "/edit", icon: Edit },
    { name: "Generate", href: "/generate", icon: FileText },
    { name: "Instructions", href: "/instructions", icon: BookOpen },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-primary/15 shadow-md shadow-primary/5">
            <div className="container flex h-16 items-center px-4">
                {/* Logo / Brand */}
                <Link href="/" className="flex items-center gap-3 mr-10 group">
                    <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-200 group-hover:scale-105">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold leading-tight text-primary tracking-tight">
                            LIET
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-none uppercase tracking-widest font-medium">
                            Progress Report System
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-1.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
