'use client'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Calculator, Home as HomeIcon } from "lucide-react"
import React from 'react'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <div className="w-full border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <NavigationMenu className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              MfolioCal
            </span>
          </Link>
        </div>
        <NavigationMenuList className="flex space-x-2">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={`${navigationMenuTriggerStyle()} gap-1.5 cursor-pointer ${
                pathname === "/" ? "bg-accent text-accent-foreground font-semibold" : ""
              }`}
            >
              <Link href="/">
                <Calculator className="size-4 text-primary" />
                <span>SIP Calculator</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={`${navigationMenuTriggerStyle()} gap-1.5 cursor-pointer ${
                pathname === "/home-loan" ? "bg-accent text-accent-foreground font-semibold" : ""
              }`}
            >
              <Link href="/home-loan">
                <HomeIcon className="size-4 text-orange-500" />
                <span>Home Loan EMI</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default Navbar