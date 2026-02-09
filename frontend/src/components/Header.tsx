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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Preview", href: "/preview", icon: Eye },
    { name: "Edit", href: "/edit", icon: Edit },
    { name: "Generate", href: "/generate", icon: FileText },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b">
            <div className="container flex h-16 items-center">
                <Link href="/" className="flex items-center gap-3 mr-8 group">
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold leading-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            LORDS
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-none uppercase tracking-wider">
                            Progress Reports
                        </span>
                    </div>
                </Link>
                <nav className="flex items-center gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "gap-2 transition-all",
                                        isActive && "shadow-lg shadow-primary/25"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
