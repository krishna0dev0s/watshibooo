import {
  SignedOut,
  SignedIn,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Code2,
  DollarSign,
  FileText,
  GraduationCapIcon,
  LayoutDashboard,
  PenBox,
  StarsIcon,
  MapPin,
  BookOpen,
  Zap,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";

const Header = async() => {
  try {
    await checkUser();
  } catch (error) {
    console.error("Error checking user in header:", error);
  }
  return (
    <header
      className="border-b sticky top-0 z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        color: "var(--card-foreground)",
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/image.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-4">
          <SignedIn>
            {/* Dashboard */}
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Industry Insights</span>
              </Button>
            </Link>

            {/* Analytics */}
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </Link>

            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <StarsIcon className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Growth Tools</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Career Boosters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    <span>Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ai-cover-letter" className="flex items-center gap-2 w-full">
                    <PenBox className="h-4 w-4" />
                    <span>Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2 w-full">
                    <GraduationCapIcon className="h-4 w-4" />
                    <span>Interview Prep</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leetcode" className="flex items-center gap-2 w-full">
                    <Code2 className="h-4 w-4" />
                    <span>Leetcode</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/roadmap" className="flex items-center gap-2 w-full">
                    <MapPin className="h-4 w-4" />
                    <span>Roadmap</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/learning-path" className="flex items-center gap-2 w-full">
                    <Zap className="h-4 w-4" />
                    <span>Structured Learning Path</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2 w-full">
                    <DollarSign className="h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          {/* Auth Buttons */}
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <Button variant="outline">Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          {/* User Avatar */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;