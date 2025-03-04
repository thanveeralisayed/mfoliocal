'use client'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
  } from "@/components/ui/navigation-menu"
import Link from "next/link"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import React from 'react'

const Navbar = () => {
  return (
    <div className="w-full border-b border-gray-300">
      <NavigationMenu className="flex justify-between items-center p-4">
        <div className="flex items-center">
          {/* <img src="/path/to/logo.png" alt="Site Logo" className="h-8 w-8 mr-2" /> */}
          <span className="text-xl font-bold mr-2">MfolioCal</span>
        </div>
        <NavigationMenuList className="flex space-x-4">
          <NavigationMenuItem className="mr-0">
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Sip Calculator
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default Navbar